import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import type { FormEvent } from "react";
import { useActivities } from "../../../lib/hooks/useActivities";

type Props = {
  closeForm: () => void;
  activity?: Activity;
};
export default function ActivityForm({ closeForm, activity }: Props) {
  const { updateActivity, createActivity } = useActivities();

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
      closeForm();
    } else {
      await createActivity.mutateAsync(data as unknown as Activity);
      closeForm();
    }
  };

  return (
    <Paper sx={{ borderRadius: 3, padding: 2 }}>
      <Typography variant="h5" gutterBottom color="primary">
        Create Activity
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
          defaultValue={
            activity?.date
              ? new Date(activity.date).toISOString()
              : new Date().toISOString()
          }
          variant="outlined"
          type="datetime-local"
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
          <Button color="inherit" onClick={closeForm}>
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
