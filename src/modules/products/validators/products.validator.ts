import { z } from "zod";
import { objectIdSchema } from "../../../core/validators/objectId.validation";

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Product name cannot be empty."),
  image_url: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      try {
        const url = new URL(val);
        return !!url.protocol;
      } catch (e) {
        return (
          /^\/(uploads\/.*|images\/.*)/.test(val) || /^uploads\//.test(val)
        );
      }
    }, "Image URL must be a valid absolute URL or a local uploads path (e.g. /uploads/products/...)."),
  category_id: objectIdSchema.min(1, "Category ID is required."),
  subcategory_id: objectIdSchema.min(1, "Subcategory ID is required."),
  description: z.string().trim().optional(),
});

// Schema for updating an existing product
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
