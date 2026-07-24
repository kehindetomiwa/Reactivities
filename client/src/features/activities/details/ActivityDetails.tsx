import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";

type Props = {
  activity: Activity;
  cancelSelectedActivity: () => void;
  openForm: (id: string) => void;
};

export default function ActivityDetails({ activity, cancelSelectedActivity, openForm }: Props) {
  return (
    <Card sx={{ borderRadius: 2, p: 2, mb: 2, bgcolor: "#eeeeee" }}>
      <CardMedia
        component="img"
        height="300"
        image={`/images/categoryImages/${activity.category}.jpg`}
        alt={activity.title}
      />
      <CardContent>
        <Typography variant="h5">{activity.title}</Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: "light" }}>
          {activity.date}
        </Typography>
        <Typography variant="body2">{activity.description}</Typography>
      </CardContent>
      <CardActions>
        <Button color="primary" onClick={() => openForm(activity.id)}>
          Edit
        </Button>
        <Button onClick={cancelSelectedActivity} color="inherit">
          Cancel
        </Button>
      </CardActions>
    </Card>
  );
}
