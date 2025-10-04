import { z } from "zod";

// Zod schema for validating MongoDB ObjectId format
// Provide a required_error so missing ids produce a clear message when used in required fields
export const objectIdSchema = z
  .string()
  .min(1, "Category ID is required")
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId format");
