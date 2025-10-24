import { objectIdSchema } from "../../../core/validators/objectId.validation";
import { z } from "zod";

export const createSubcategorySchema = z.object({
  category_id: objectIdSchema.min(1, "Category ID is required"),
  name: z.string().trim().min(1, "Subcategory name cannot be empty"),
  status: z.enum(["available", "coming_soon"]).optional(),
  kilo_to_price_map: z.record(z.string(), z.number().nonnegative()).optional(),
  upfront_payment: z.number().nonnegative(),
  is_pieceable: z.boolean().optional(),
  price: z.number().nonnegative().optional(),
});

export const updateSubcategorySchema = z
  .object({
    category_id: objectIdSchema.optional(),
    name: z
      .string()
      .trim()
      .min(1, "Subcategory name cannot be empty")
      .optional(),
    status: z.enum(["available", "coming_soon"]).optional(),
    kilo_to_price_map: z
      .record(z.string(), z.number().nonnegative())
      .optional(),
    upfront_payment: z.number().nonnegative().optional(),
    is_pieceable: z.boolean().optional(),
    price: z.number().nonnegative().optional(),
  })
  .refine(
    (data: { category_id?: unknown; name?: unknown; status?: unknown }) =>
      data.category_id !== undefined ||
      data.name !== undefined ||
      data.status !== undefined,
    {
      message:
        "At least one field (category_id, name, or status) must be provided for update.",
      path: ["category_id", "name", "status"],
    }
  );
