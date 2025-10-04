import z from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name cannot be empty"),
  description: z.string().trim().optional(),
});

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1, "Category name cannot be empty").optional(),
    description: z.string().trim().optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message:
      "At least one field (name or description) must be provided for update",
    path: ["name", "description"],
  });
