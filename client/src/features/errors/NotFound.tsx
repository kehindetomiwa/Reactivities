import { SearchOff } from "@mui/icons-material";
import { Button, Paper, Typography } from "@mui/material";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <Paper
      sx={{
        height: 400,
      }}
    >
      <SearchOff
        sx={{
          fontSize: 100,
        }}
        color="primary"
      />
      <Typography>Oops - we could not find what you are lookinf for</Typography>
      <Button fullWidth component={Link} to="/activities">
        Return to the activities page
      </Button>
    </Paper>
  );
}
