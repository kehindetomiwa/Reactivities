import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container,
  Button,
  LinearProgress,
} from "@mui/material";
import Group from "@mui/icons-material/Group";
import { NavLink } from "react-router";
import { UiStore } from "../../lib/stores/uiStore";
import { useStore } from "../../lib/hooks/useStores";
import { Observer } from "mobx-react-lite";

const navLinks = [
  { title: "Activities", path: "/activities" },
  { title: "Create Activity", path: "/createActivity" },
  { title: "Counter", path: "/counter" },
];

const navStyles = {
  color: "inherit",
  textTransform: "uppercase",
  fontSize: "1.2rem",
  fontWeight: "bold",
  "&.active": {
    color: "#F9E8A2",
  },
};

export default function NavBar() {
  const { uiStore } = useStore();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          position: "relative",
          backgroundImage:
            "linear-gradient(135deg, #182a73 0%, #218aae 69%, #20a7ac 89%)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              component={NavLink}
              to="/"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Group fontSize="large" />
              <Typography
                variant="h4"
                sx={{ color: "inherit", fontWeight: "bold" }}
              >
                Reactivities
              </Typography>
            </Button>

            <Box sx={{ display: "flex", gap: 2 }}>
              {navLinks.map(({ title, path }) => (
                <Button key={path} component={NavLink} to={path} sx={navStyles}>
                  {title}
                </Button>
              ))}
            </Box>

            <Button sx={navStyles}>User Menu</Button>
          </Toolbar>
        </Container>
        <Observer>
          {() =>
            uiStore.isLoading ? (
              <LinearProgress
                color="secondary"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                }}
              />
            ) : null
          }
        </Observer>
      </AppBar>
    </Box>
  );
}
