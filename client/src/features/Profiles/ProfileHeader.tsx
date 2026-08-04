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

type Props = {
  profile: Profile;
  isCurrentUser: boolean;
};

export default function ProfileHeader({ profile, isCurrentUser }: Props) {
  // The API's UserProfile DTO has no follow fields yet, so these stay undefined
  // until the backend grows them - fall back rather than render "undefined".
  const isFollowing = profile.following ?? false;
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
              {isFollowing && (
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
                <Typography variant="h6">{profile.followersCount ?? 0}</Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6">Following</Typography>
                <Typography variant="h6">{profile.followingCount ?? 0}</Typography>
              </Box>
            </Box>
            <Divider sx={{ width: "100%" }} />
            {/* You cannot follow yourself, so the action is hidden on your own profile. */}
            {!isCurrentUser && (
              <Button
                fullWidth
                variant="outlined"
                color={isFollowing ? "error" : "success"}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
