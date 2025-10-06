import { z } from "zod";
import { objectIdSchema } from "../../../core/validators/objectId.validation";

// Helper schema for kilo_to_price_map
const kiloToPriceMapSchema = z
  .record(
    z
      .string()
      .regex(
        /^\d+(\.\d+)?kg$/i,
        'Weight keys must be in "Xkg" or "X.Ykg" format.'
      ),
    z.number().positive("Price must be a positive number.")
  )
  .optional(); // Optional at the top level, but conditional logic will enforce its presence

// Schema for creating a new product
export const createProductSchema = z
  .object({
    name: z.string().trim().min(1, "Product name cannot be empty."),
    image_url: z.string().url("Image URL must be a valid URL.").optional(),
    category_id: objectIdSchema.min(1, "Category ID is required."),
    subcategory_id: objectIdSchema.min(1, "Subcategory ID is required."),
    description: z.string().trim().optional(),
    kilo_to_price_map: kiloToPriceMapSchema,
    is_pieceable: z.boolean(),
    pieces: z
      .number()
      .int()
      .positive("Pieces must be a positive integer.")
      .optional(),
    upfront_payment: z
      .number()
      .positive("Upfront payment must be a positive number.")
      .optional(),
  })
  .refine(
    (data) => {
      // If product is pieceable, pieces must be provided and kilo_to_price_map should be empty or absent
      if (data.is_pieceable) {
        if (data.pieces === undefined || data.pieces === null) {
          return false;
        }
        // Optionally, if pieceable, enforce no kilo_to_price_map or an empty one
        // if (data.kilo_to_price_map && Object.keys(data.kilo_to_price_map).length > 0) {
        //   return false;
        // }
      } else {
        // If not pieceable, kilo_to_price_map must be provided and not empty
        if (
          !data.kilo_to_price_map ||
          Object.keys(data.kilo_to_price_map).length === 0
        ) {
          return false;
        }
        // Optionally, if not pieceable, enforce no pieces or 0
        // if (data.pieces !== undefined && data.pieces > 0) {
        //   return false;
        // }
      }
      return true;
    },
    {
      message:
        "Product must be either pieceable (with pieces) or sold by kilo (with kilo_to_price_map).",
      path: ["is_pieceable", "pieces", "kilo_to_price_map"],
    }
  );

// Schema for updating an existing product
export const updateProductSchema = z
  .object({
    name: z.string().trim().min(1, "Product name cannot be empty.").optional(),
    image_url: z.string().url("Image URL must be a valid URL.").optional(),
    category_id: objectIdSchema.optional(),
    subcategory_id: objectIdSchema.optional(),
    description: z.string().trim().optional(),
    kilo_to_price_map: kiloToPriceMapSchema,
    is_pieceable: z.boolean().optional(),
    pieces: z
      .number()
      .int()
      .positive("Pieces must be a positive integer.")
      .optional(),
    upfront_payment: z
      .number()
      .positive("Upfront payment must be a positive number.")
      .optional(),
  })
  .refine(
    (data) => {
      // At least one field must be provided for update
      if (Object.keys(data).length === 0) {
        return false;
      }
      return true;
    },
    {
      message: "At least one field must be provided for update.",
    }
  );
