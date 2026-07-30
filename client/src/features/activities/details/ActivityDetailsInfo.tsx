import { CalendarToday, Info, Place } from "@mui/icons-material";
import { Box, Button, Divider, Grid, Paper, Typography } from "@mui/material";
import { useState } from "react";
import MapComponent from "../../../app/shared/components/MapComponent";

export default function ActivityDetailsInfo() {
  const [mapOpen, setMapOpen] = useState(false);
  return (
    <Paper sx={{ mb: 2 }}>
      <Grid container sx={{ alignItems: "center", pl: 2, py: 1 }}>
        <Grid size={1}>
          <Info color="info" fontSize="large" />
        </Grid>
        <Grid size={11}>
          <Typography>Activity description</Typography>
        </Grid>
      </Grid>
      <Divider />
      <Grid container sx={{ alignItems: "center", pl: 2, py: 1 }}>
        <Grid size={1}>
          <CalendarToday color="info" fontSize="large" />
        </Grid>
        <Grid size={11}>
          <Typography>1 Jan 2025 at 1:40pm</Typography>
        </Grid>
      </Grid>
      <Divider />

      <Grid container sx={{ alignItems: "center", pl: 2, py: 1 }}>
        <Grid size={1}>
          <Place color="info" fontSize="large" />
        </Grid>
        <Grid
          size={11}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography>Venue, City</Typography>
          <Button onClick={() => setMapOpen(!mapOpen)}>
            {mapOpen ? "Hide map" : "Show map"}
          </Button>
        </Grid>
      </Grid>
      {mapOpen && (
        <Box sx={{ height: 400, zIndex: 1000, display: "block" }}>
          <MapComponent />
        </Box>
      )}
    </Paper>
  );
}
