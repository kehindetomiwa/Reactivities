import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
} from "@mui/material";
import Group from "@mui/icons-material/Group";
type Props = {
  openForm: () => void;
};

export default function NavBar({ openForm }: Props) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          backgroundImage:
            "linear-gradient(135deg, #182a73 0%, #218aae 69%, #20a7ac 89%)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Group fontSize="large" />
              <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: "bold" }}>
                Reactivities
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 4 }}>
              {["Activities", "About", "Contact"].map((item) => (
                <Typography
                  key={item}
                  sx={{
                    fontSize: "1.2rem",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
            <Button
              size="large"
              color="warning"
              variant="contained"
              onClick={openForm}
            >
              Create Activity
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}
