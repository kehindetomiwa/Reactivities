import { Box, Button } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useParams } from "react-router";
import {
  editProfileSchema,
  type EditProfileSchema,
} from "../../lib/Schemas/editProfileSchema";
import { useProfile } from "../../lib/hooks/useProfile";
import TextInput from "../../app/shared/components/TextInput";

type Props = {
  setEditMode: (editMode: boolean) => void;
};

export default function ProfileEditForm({ setEditMode }: Props) {
  const { id } = useParams();
  const { profile, updateProfile } = useProfile(id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid, isDirty },
  } = useForm<EditProfileSchema>({
    mode: "onTouched",
    resolver: zodResolver(editProfileSchema),
  });

  // The profile may still be loading on first render, so populate once it lands.
  useEffect(() => {
    if (profile)
      reset({ displayName: profile.displayName, bio: profile.bio ?? "" });
  }, [profile, reset]);

  const onSubmit = (data: EditProfileSchema) => {
    updateProfile.mutate(data, {
      onSuccess: () => setEditMode(false),
    });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}
    >
      <TextInput label="Display Name" control={control} name="displayName" />
      <TextInput
        label="Add your bio"
        control={control}
        name="bio"
        multiline
        rows={4}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={!isValid || !isDirty || updateProfile.isPending}
        sx={{ alignSelf: "flex-start" }}
      >
        Update profile
      </Button>
    </Box>
  );
}
