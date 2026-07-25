import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import { Link, useNavigate, useParams } from "react-router";
import { useActivities } from "../../../lib/hooks/useActivities";

export default function ActivityDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { activity, isLoadingActivity } = useActivities(id);
  if (isLoadingActivity) return <Typography>Loading Activity</Typography>;
  if (!activity) return <Typography>Activity not Found</Typography>;

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
        <Button component={Link} to={`/manage/${activity.id}`} color="primary">
          Edit
        </Button>
        <Button onClick={() => navigate("/activities")} color="inherit">
          Cancel
        </Button>
      </CardActions>
    </Card>
  );
}
