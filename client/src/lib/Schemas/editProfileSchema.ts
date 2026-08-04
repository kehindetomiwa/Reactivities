import { z } from "zod";

export const editProfileSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  // Registration never collects a bio, so an existing profile may not have one.
  bio: z.string().optional(),
});

export type EditProfileSchema = z.infer<typeof editProfileSchema>;
