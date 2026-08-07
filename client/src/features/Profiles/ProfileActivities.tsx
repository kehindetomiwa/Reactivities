import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { useState, type SyntheticEvent } from "react";
import { Link, useParams } from "react-router";
import { useProfile } from "../../lib/hooks/useProfile";

// Index -> the filter value the API expects. "hosting" is deliberately not
// date-bounded server-side: it lists every activity the user hosts.
const tabs = [
  { label: "Future Events", filter: "future" },
  { label: "Past Events", filter: "past" },
  { label: "Hosting", filter: "hosting" },
];

export default function ProfileActivities() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  // Set in the initializer rather than a mount effect: this component only
  // renders on the Events tab, so the query is still gated to that tab, and
  // react-hooks/set-state-in-effect rejects the setState-on-mount version.
  // Every other useProfile caller passes no filter, which leaves the query
  // disabled for them.
  const [filter, setFilter] = useState(tabs[0].filter);
  const { userActivities, loadingUserActivities } = useProfile(
    id,
    undefined,
    filter,
  );

  const handleChange = (_: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setFilter(tabs[newValue].filter);
  };

  return (
    <Box>
      <Tabs value={activeTab} onChange={handleChange} sx={{ mb: 3 }}>
        {tabs.map((tab) => (
          <Tab key={tab.filter} label={tab.label} />
        ))}
      </Tabs>

      {loadingUserActivities ? (
        <Typography>Loading...</Typography>
      ) : !userActivities?.length ? (
        <Typography>No activities to show here.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {userActivities.map((activity) => (
            <Link
              key={activity.id}
              to={`/activities/${activity.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Card sx={{ borderRadius: 2, width: 200 }} elevation={3}>
                <CardMedia
                  component="img"
                  height={100}
                  image={`/images/categoryImages/${activity.category}.jpg`}
                  alt={`${activity.category} image`}
                />
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {activity.title}
                  </Typography>
                  <Typography variant="body2">
                    {format(activity.date, "do MMM yyyy")}
                  </Typography>
                  <Typography variant="body2">
                    {format(activity.date, "h:mm a")}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          ))}
        </Box>
      )}
    </Box>
  );
}
