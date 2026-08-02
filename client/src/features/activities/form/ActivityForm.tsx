import { Box, Button, Paper, Typography } from "@mui/material";
import { useActivities } from "../../../lib/hooks/useActivities";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import {
  activitySchema,
  type ActivitySchema,
} from "../../../lib/Schemas/ActivitySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import TextInput from "../../../app/shared/components/TextInput";
import SelectInput from "../../../app/shared/components/SelectInput";
import { categoryOptions } from "./categoryOptions";
import DateTimeInput from "../../../app/shared/components/DateTimeInput";

export default function ActivityForm() {
  const { reset, handleSubmit, control } = useForm<ActivitySchema>({
    mode: "onTouched",
    resolver: zodResolver(activitySchema),
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const { updateActivity, createActivity, activity, isLoadingActivity } =
    useActivities(id);

  useEffect(() => {
    if (activity) reset({ ...activity, date: new Date(activity.date) });
  }, [activity, reset]);

  const OnSubmit = async (data: ActivitySchema) => {
    // The API models `date` as an ISO string; the picker gives us a Date.
    const payload = { ...data, date: data.date.toISOString() };
    try {
      if (activity) {
        updateActivity.mutate(
          { ...activity, ...payload },
          {
            onSuccess: () => navigate(`/activities/${activity.id}`),
          }
        );
      } else {
        createActivity.mutate(payload as unknown as Activity, {
          onSuccess: (id) => navigate(`/activities/${id}`),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoadingActivity) return <Typography>Loading Activity...</Typography>;

  return (
    <Paper sx={{ borderRadius: 3, padding: 2 }}>
      <Typography variant="h5" gutterBottom color="primary">
        {activity ? "Edit Activity" : "Create Activity"}
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit(OnSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        <TextInput label="Title" control={control} name="title" />
        <TextInput
          label="Description"
          control={control}
          name="description"
          multiline
          rows={3}
        />
        <SelectInput
          items={categoryOptions}
          label="Category"
          control={control}
          name="category"
        />
        <DateTimeInput label="Date" control={control} name="date" />
        <TextInput label="City" control={control} name="city" />
        <TextInput label="Venue" control={control} name="venue" />

        <Box sx={{ display: "flex", justifyContent: "end", gap: 3 }}>
          <Button
            color="inherit"
            onClick={() =>
              navigate(activity ? `/activities/${activity.id}` : "/activities")
            }
          >
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
