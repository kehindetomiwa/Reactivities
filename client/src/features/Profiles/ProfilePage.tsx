import { Box, Skeleton, Typography } from "@mui/material";
import { useParams } from "react-router";
import { useProfile } from "../../lib/hooks/useProfile";
import { useAccount } from "../../lib/hooks/useAccount";
import ProfileHeader from "./ProfileHeader";
import ProfileContent from "./ProfileContent";

export default function ProfilePage() {
  const { id } = useParams();
  const { profile, loadingProfile } = useProfile(id);
  const { currentUser } = useAccount();

  if (loadingProfile) {
    return <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />;
  }

  if (!profile) {
    return (
      <Typography variant="h5">
        Profile not found. Check the link and try again.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <ProfileHeader
        profile={profile}
        isCurrentUser={currentUser?.id === profile.id}
      />
      <ProfileContent />
    </Box>
  );
}
