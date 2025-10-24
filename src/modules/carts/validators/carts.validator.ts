import z from "zod";
import { objectIdSchema } from "../../../core/validators/objectId.validation";

// Carts validator placeholder.
const oidRegex = /^[0-9a-fA-F]{24}$/;
const productIdSchema = z
  .string()
  .min(1, "Product ID is required.")
  .regex(oidRegex, "Invalid MongoDB ObjectId format");
const userIdSchema = z
  .string()
  .min(1, "User ID is required.")
  .regex(oidRegex, "Invalid MongoDB ObjectId format");

const parseKilo = (val: unknown) => {
  if (val === undefined || val === null) return undefined;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    // allow values like "1kg", "2 kg", or just "1"
    const cleaned = val.replace(/\s*/g, "").toLowerCase();
    const match = cleaned.match(/^(\d+(?:\.\d+)?)(kg)?$/);
    if (match) return Number(match[1]);
  }
  return val;
};

const baseCartItemSchema = z.object({
  product_id: productIdSchema,
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1.")
    .optional()
    .default(1),
  kilo: z.preprocess(
    parseKilo,
    z.number().positive("Kilo must be a positive number.").optional()
  ),
  pieces: z
    .number()
    .int()
    .positive("Pieces must be a positive integer.")
    .optional(),
  custom_text: z.string().trim().optional(),
  additional_description: z.string().trim().optional(),
});

export const addToCartSchema = baseCartItemSchema.extend({
  user_id: userIdSchema,
});

export const updateCartItemSchema = baseCartItemSchema
  .omit({ product_id: true })
  .partial()
  .refine(
    (data) =>
      data.quantity !== undefined ||
      data.kilo !== undefined ||
      data.pieces !== undefined ||
      data.custom_text !== undefined ||
      data.additional_description !== undefined,
    {
      message: "At least one field must be provided to update.",
      path: [
        "quantity",
        "kilo",
        "pieces",
        "custom_text",
        "additional_description",
      ],
    }
  );
