import { objectIdSchema } from "../../../core/validators/objectId.validation";
import { z } from "zod";
// Reviews validator placeholder.
export const createProductReviewSchema = z.object({
  product_id: objectIdSchema.min(1, "Product ID is required"),
  user_id: objectIdSchema.min(1, "User ID is required"),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5."),
  comment: z.string().trim().optional(),
});

export const updateProductReviewSchema = z
  .object({
    rating: z
      .number()
      .int()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5.")
      .optional(),
    comment: z.string().trim().optional(),
  })
  .refine((data) => data.rating !== undefined || data.comment !== undefined, {
    message:
      "At least one field (rating or comment) must be provided for update.",
    path: ["rating", "comment"],
  });
