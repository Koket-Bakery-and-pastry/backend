import { z } from "zod";
import { Types } from "mongoose";

const objectIdSchema = z
  .string()
  .length(24)
  .regex(/^[0-9a-fA-F]{24}$/)
  .transform((val) => new Types.ObjectId(val));

export const createCustomCakeValidation = z.object({
  product_id: objectIdSchema,
  description: z.string().min(10).max(2000),
  kilo: z.number().min(0.5).max(50).optional(),
  pieces: z.number().min(1).max(100).optional(),
  quantity: z.number().min(1).max(10).default(1),
  custom_text: z.string().max(500).optional().or(z.literal("")),
  additional_description: z.string().max(1000).optional().or(z.literal("")),
  estimated_price: z.number().min(0),
});

export const updateCustomCakeValidation = z.object({
  description: z.string().min(10).max(2000).optional(),
  kilo: z.number().min(0.5).max(50).optional(),
  pieces: z.number().min(1).max(100).optional(),
  quantity: z.number().min(1).max(10).optional(),
  custom_text: z.string().max(500).optional().or(z.literal("")),
  additional_description: z.string().max(1000).optional().or(z.literal("")),
  estimated_price: z.number().min(0).optional(),
});

export const createCustomOrderValidation = z.object({
  custom_cake_id: objectIdSchema,
  phone_number: z.string().regex(/^\+?[\d\s-()]{10,}$/),
  total_price: z.number().min(0),
  upfront_paid: z.number().min(0),
  delivery_time: z.coerce.date().refine((d) => d > new Date(), {
    message: "delivery_time must be in the future",
  }),
});

export const updateCustomOrderValidation = z.object({
  status: z.enum(["pending", "accepted", "rejected", "completed"]).optional(),
  rejection_comment: z.string().max(1000).optional().or(z.literal("")),
  upfront_paid: z.number().min(0).optional(),
  total_price: z.number().min(0).optional(),
});

export const customOrderQueryValidation = z.object({
  status: z.enum(["pending", "accepted", "rejected", "completed"]).optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  user_id: objectIdSchema.optional(),
});
