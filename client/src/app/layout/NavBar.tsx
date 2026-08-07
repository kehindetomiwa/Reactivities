import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container,
  Button,
  CircularProgress,
} from "@mui/material";
import Group from "@mui/icons-material/Group";
import { NavLink } from "react-router";
import { useStore } from "../../lib/hooks/useStores";
import { Observer } from "mobx-react-lite";
import { useAccount } from "../../lib/hooks/useAccount";
import MenuItemLink from "../shared/components/MenuItemLink";
import UserMenu from "./UserMenu";

const navLinks = [
  { title: "Activities", path: "/activities" },
  { title: "Counter", path: "/counter" },
  { title: "TestErrors", path: "/errors" },
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
  const { currentUser } = useAccount();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          backgroundImage:
            "linear-gradient(135deg, #182a73 0%, #218aae 69%, #20a7ac 89%)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              component={NavLink}
              to="/"
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Group fontSize="large" />
              <Typography
                variant="h4"
                sx={{ color: "inherit", fontWeight: "bold" }}
              >
                Reactivities
              </Typography>
              {/* Must stay inside the Button: `left: 105%` is relative to the
                  nearest positioned ancestor, and the Button is the one with
                  `position: relative`. As a sibling it resolved against the
                  Toolbar instead and landed off-screen. */}
              <Observer>
                {() =>
                  uiStore.isLoading ? (
                    <CircularProgress
                      size={20}
                      thickness={7}
                      sx={{
                        position: "absolute",
                        color: "white",
                        top: "30%",
                        left: "105%",
                      }}
                    />
                  ) : null
                }
              </Observer>
            </Button>

            <Box sx={{ display: "flex", gap: 2 }}>
              {navLinks.map(({ title, path }) => (
                <Button key={path} component={NavLink} to={path} sx={navStyles}>
                  {title}
                </Button>
              ))}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {currentUser ? (
                <>
                  <UserMenu />
                </>
              ) : (
                <>
                  <MenuItemLink to="/register">Register</MenuItemLink>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}
