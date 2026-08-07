import { Box, Button, Typography } from "@mui/material";
import { useEffect } from "react";
import ActivityCard from "./ActivityCard";
import { useActivities } from "../../../lib/hooks/useActivities";
import { useInView } from "react-intersection-observer";
import { observer } from "mobx-react-lite";

const ActivityList = observer(function ActivityList() {
  const {
    activitiesGroup,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useActivities();
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (!activitiesGroup || isLoading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {activitiesGroup.pages.map((page, index) => (
        <Box
          key={index}
          ref={index === activitiesGroup.pages.length - 1 ? ref : null}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {page.items.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </Box>
      ))}
      {hasNextPage && (
        <Button
          variant="outlined"
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      )}
    </Box>
  );
});

export default ActivityList;
