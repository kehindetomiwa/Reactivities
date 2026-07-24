import { Box, Container, CssBaseline } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import NavBar from "./NavBar";
import ActivityDashboard from "../../features/activities/dashboard/ActivityDashboard";


function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    axios
      .get<Activity[]>("https://localhost:5001/api/activities")
      .then((response) => setActivities(response.data));
    return () => {};
  }, [])

  const handleSelectedActivity = (id: string) => {
    setSelectedActivity(activities.find(x => x.id === id));

  }
  const handleCancelSelectedActivity = () => {
    setSelectedActivity(undefined);
  }

  const handleFormOpen = (id?: string) => {
    if (id) {
      handleSelectedActivity(id);
    } else {
      handleCancelSelectedActivity();
    }
    setEditMode(true);
  }

  const handleFormClose = () => {
    setEditMode(false);
  }
 
  const handleSubmitForm = (activity: Activity) => {
    if (activity.id) {
      setActivities(activities.map(x => x.id === activity.id ? activity : x));
    } else {
      const newActivity = { ...activity, id: crypto.randomUUID() };
      setSelectedActivity(newActivity);
      setActivities([...activities, newActivity]);
    }
    setEditMode(false);
  }

  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter(x => x.id !== id));
  }

  return (
    <Box sx={{ bgcolor: '#eeeeee'}}  >
      <CssBaseline />
      <NavBar openForm={handleFormOpen} />

      <Container maxWidth="xl" sx={{ mt: 3}}>
        <ActivityDashboard 
        activities={activities} 
        selectActivity={handleSelectedActivity}
        cancelSelectedActivity={handleCancelSelectedActivity}
        selectedActivity={selectedActivity}
        editMode={editMode}
        openForm={handleFormOpen}
        closeForm={handleFormClose}
        submitForm={handleSubmitForm}
        deleteActivity={handleDeleteActivity}
        />
      </Container>
      
    </Box>
  );
}

export default App;
