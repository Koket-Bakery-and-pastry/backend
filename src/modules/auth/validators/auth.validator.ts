import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  email: z.string().email({ message: "Please provide a valid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Please provide a valid email" }),
  password: z.string(),
});

export const googleAuthSchema = z.object({
  token: z.string(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});
