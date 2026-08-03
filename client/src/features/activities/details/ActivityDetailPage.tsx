import { Grid, Typography } from "@mui/material";
import { useActivities } from "../../../lib/hooks/useActivities";
import ActivityDetailsHeader from "./ActivityDetailsHeader";
import ActivityDetailsInfo from "./ActivityDetailsInfo";
import ActivityDetailChat from "./ActivityDetailChat";
import ActivityDetailsSidebar from "./ActivityDetailsSidebar";
import { useParams } from "react-router";

export default function ActivityDetailPage() {
  const { id } = useParams();
  const { activity, isLoadingActivity } = useActivities(id);
  if (isLoadingActivity) return <Typography>Loading Activity</Typography>;
  if (!activity) return <Typography>Activity not Found</Typography>;

  return (
    <Grid container spacing={3}>
      <Grid size={8}>
        <ActivityDetailsHeader activity={activity} />
        <ActivityDetailsInfo />
        <ActivityDetailChat />
      </Grid>
      <Grid size={4}>
        <ActivityDetailsSidebar activity={activity} />
      </Grid>
    </Grid>
  );
}
