import { z } from "zod";

// Zod schema for validating MongoDB ObjectId format
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId format");
