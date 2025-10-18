import { z } from "zod";

export const analyticsQueryValidation = z.object({
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  period: z.enum(["daily", "weekly", "monthly"]).optional().default("daily"),
  category_id: z
    .string()
    .length(24)
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  product_id: z
    .string()
    .length(24)
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
});

export const dateRangeValidation = z.object({
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
});
