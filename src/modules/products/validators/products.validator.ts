import { z } from "zod";
import { objectIdSchema } from "../../../core/validators/objectId.validation";

// Schema for creating a new product
// Note: Products inherit pricing (kilo_to_price_map, is_pieceable, pieces, upfront_payment) from their subcategory
// These fields should NOT be set on the product itself
export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Product name cannot be empty."),
  image_url: z.string().optional(),
  images: z.array(z.string()).optional(),
  category_id: objectIdSchema.min(1, "Category ID is required."),
  subcategory_id: objectIdSchema.min(1, "Subcategory ID is required."),
  description: z.string().trim().optional(),
});

// Schema for updating an existing product
// Note: Products inherit pricing from their subcategory, so pricing fields are not updateable on products
export const updateProductSchema = z
  .object({
    name: z.string().trim().min(1, "Product name cannot be empty.").optional(),
    image_url: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true; // optional
        try {
          const url = new URL(val);
          return !!url.protocol;
        } catch (e) {
          return (
            /^\/(uploads\/.*|images\/.*)/.test(val) || /^uploads\//.test(val)
          );
        }
      }, "Image URL must be a valid absolute URL or a local uploads path (e.g. /uploads/products/...)."),
    images: z.array(z.string()).optional(),
    category_id: objectIdSchema.optional(),
    subcategory_id: objectIdSchema.optional(),
    description: z.string().trim().optional(),
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
