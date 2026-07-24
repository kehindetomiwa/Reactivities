import { Grid } from "@mui/material";
import ActivityList from "./ActivityList";
import ActivityDetails from "../details/ActivityDetails";
import ActivityForm from "../form/ActivityForm";

type Props = {
  activities: Activity[];
  selectActivity: (id: string) => void;
  cancelSelectedActivity: () => void;
  selectedActivity?: Activity;
  openForm: (id: string) => void;
  closeForm: () => void;
  editMode: boolean;
};

export default function ActivityDashboard({
  activities,
  selectActivity,
  cancelSelectedActivity,
  selectedActivity,
  openForm,
  closeForm,
  editMode,
}: Props) {
  return (
    <Grid container spacing={3}>
      <Grid size={7}>
        <ActivityList activities={activities} selectActivity={selectActivity}/>
      </Grid>
      <Grid size={5}>
        {selectedActivity && !editMode && (
          <ActivityDetails
            selectedActivity={selectedActivity}
            cancelSelectedActivity={cancelSelectedActivity}
            openForm={openForm}
          />
        )}
        {editMode && 
        <ActivityForm closeForm={closeForm} activity={selectedActivity} />}
      </Grid>
    </Grid>
  );
}
