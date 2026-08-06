import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useParams } from "react-router";
import { useProfile } from "../../lib/hooks/useProfile";

export default function ProfileHeader() {
  const { id } = useParams();
  const { isCurrentUser, profile, updateFollowing } = useProfile(id);

  if (!profile) return null;
  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        borderRadius: 3,
      }}
    >
      <Grid container spacing={2}>
        <Grid size={8}>
          <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
            <Avatar
              src={profile.imageUrl}
              alt={`${profile.displayName} image`}
              sx={{ width: 150, height: 150 }}
            />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="h4">{profile.displayName}</Typography>
              {profile.following && (
                <Chip
                  variant="outlined"
                  color="secondary"
                  label="following"
                  sx={{
                    borderRadius: 1,
                  }}
                />
              )}
            </Box>
          </Stack>
        </Grid>
        <Grid size={4}>
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                width: "100%",
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6">Followers</Typography>
                <Typography variant="h6">{profile.followersCount}</Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6">Following</Typography>
                <Typography variant="h6">{profile.followingCount}</Typography>
              </Box>
            </Box>

            {/* You cannot follow yourself, so the action is hidden on your own profile. */}
            {!isCurrentUser && (
              <>
                <Divider sx={{ width: "100%" }} />
                <Button
                  onClick={() => updateFollowing.mutate()}
                  disabled={updateFollowing.isPending}
                  fullWidth
                  variant="outlined"
                  color={profile.following ? "error" : "success"}
                >
                  {profile.following ? "Unfollow" : "Follow"}
                </Button>
              </>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
