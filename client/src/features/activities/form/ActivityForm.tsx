import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import type { FormEvent } from "react";
import { useActivities } from "../../../lib/hooks/useActivities";
import { useNavigate, useParams } from "react-router";

export default function ActivityForm() {
  const {id} = useParams();
  const { updateActivity, createActivity, activity, isLoadingActivity } = useActivities(id);
  const navigate = useNavigate();

  // datetime-local inputs require "yyyy-MM-ddThh:mm" in *local* time,
  // not the UTC string that toISOString() produces.
  const toDateTimeLocal = (date: Date) => {
    const offsetMs = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data: { [key: string]: FormDataEntryValue } = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    if (activity) {
      data["id"] = activity.id;
      await updateActivity.mutateAsync(data as unknown as Activity);
      navigate(`/activities/${activity.id}`);
    } else {
      createActivity.mutate(data as unknown as Activity, {
        onSuccess: (id) => {
          navigate(`/activities/${id}`)
        }
      });
    }
  };

  if(isLoadingActivity) return <Typography>Loading Activity...</Typography>

  return (
    <Paper sx={{ borderRadius: 3, padding: 2 }}>
      <Typography variant="h5" gutterBottom color="primary">
        {activity? "Edit Activity": "Create Activity"}
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        <TextField
          name="title"
          label="Title"
          defaultValue={activity?.title || ""}
          variant="outlined"
          fullWidth
        />
        <TextField
          name="description"
          label="Description"
          defaultValue={activity?.description || ""}
          variant="outlined"
          fullWidth
          multiline
          rows={3}
        />
        <TextField
          name="category"
          label="Category"
          defaultValue={activity?.category || ""}
          variant="outlined"
          fullWidth
        />
        <TextField
          name="date"
          label="Date"
          defaultValue={toDateTimeLocal(
            activity?.date ? new Date(activity.date) : new Date()
          )}
          variant="outlined"
          type="datetime-local"
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          name="city"
          label="City"
          defaultValue={activity?.city || ""}
          variant="outlined"
          fullWidth
        />
        <TextField
          name="venue"
          label="Venue"
          defaultValue={activity?.venue || ""}
          variant="outlined"
          fullWidth
        />

        <Box sx={{ display: "flex", justifyContent: "end", gap: 3 }}>
          <Button color="inherit" onClick={() => {}}>
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={updateActivity.isPending || createActivity.isPending}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
