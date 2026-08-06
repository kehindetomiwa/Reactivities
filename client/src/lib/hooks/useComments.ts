import { useLocalObservable } from "mobx-react-lite";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  type IRetryPolicy,
} from "@microsoft/signalr";
import { useEffect } from "react";
import { runInAction } from "mobx";

// The default withAutomaticReconnect() gives up for good after four tries
// (0s, 2s, 10s, 30s). Sleeping the machine for longer than ~42s killed the chat
// until a page refresh, so keep retrying on a backoff that caps out instead.
const retryPolicy: IRetryPolicy = {
  nextRetryDelayInMilliseconds: ({ previousRetryCount }) =>
    [0, 2000, 5000, 10000][previousRetryCount] ?? 30000,
};

export const useComments = (activityId?: string) => {
  const commentStore = useLocalObservable(() => ({
    comments: [] as ChatComment[],
    hubConnection: null as HubConnection | null,
    createHubConnection(activityId: string) {
      if (!activityId || this.hubConnection) return;

      const connection = new HubConnectionBuilder()
        .withUrl(
          `${import.meta.env.VITE_COMMENT_URL}?activityId=${activityId}`,
          {
            withCredentials: true,
          },
        )
        .withAutomaticReconnect(retryPolicy)
        .build();
      this.hubConnection = connection;

      connection.on("LoadComments", (comments) => {
        runInAction(() => {
          this.comments = comments;
        });
      });
      connection.on("ReceiveComments", (comment) => {
        runInAction(() => {
          this.comments.unshift(comment);
        });
      });
      // Retries exhausted, or a close we can't come back from. Drop the handle so
      // the next createHubConnection builds a fresh one rather than holding on to
      // a permanently Disconnected object.
      connection.onclose(() => {
        if (this.hubConnection !== connection) return;
        runInAction(() => {
          this.hubConnection = null;
        });
      });

      connection
        .start()
        .catch((error) => {
          // Superseded by a stopHubConnection that ran while we were connecting -
          // not a failure worth reporting.
          if (this.hubConnection === connection) {
            console.log("Error establishing connection ", error);
          }
        })
        .finally(() => {
          // Cleanup ran mid-connect, so it left the stopping to us (see below).
          if (this.hubConnection !== connection) {
            connection.stop().catch(() => {});
          }
        });
    },
    stopHubConnection() {
      const connection = this.hubConnection;
      if (!connection || connection.state === HubConnectionState.Disconnected)
        return;

      // Cleared first so the start()/onclose handlers above can tell this was a
      // deliberate stop. Connecting and Reconnecting both need stopping too - the
      // old Connected-only check leaked a connection that outlived the component.
      this.hubConnection = null;

      // Still negotiating? Let start()'s finally stop it once that settles.
      // Calling stop() now aborts the negotiation, and SignalR's own logger
      // reports that abort as an error - noise on every StrictMode double mount.
      if (connection.state === HubConnectionState.Connecting) return;

      connection
        .stop()
        .catch((error) => console.log("Error stopping connection: ", error));
    },
  }));
  useEffect(() => {
    if (activityId) commentStore.createHubConnection(activityId);
    return () => {
      commentStore.stopHubConnection();
      runInAction(() => {
        commentStore.comments = [];
      });
    };
  }, [activityId, commentStore]);
  return { commentStore };
};
