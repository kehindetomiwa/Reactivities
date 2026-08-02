import { z } from "zod"

export const registerSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  email: z.string().email(),
  password: z.string().min(6)
})

export type RegisterSchema = z.infer<typeof registerSchema>;
