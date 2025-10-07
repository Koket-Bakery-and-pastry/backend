import { z } from "zod";
import { Types } from "mongoose";

const objectIdSchema = z
  .string()
  .length(24)
  .regex(/^[0-9a-fA-F]{24}$/)
  .transform((val) => new Types.ObjectId(val));
export const createOrderValidation = z.object({
  order_items: z
    .array(
      z.object({
        // product_id: z
        //   .string()
        //   .length(24)
        //   .regex(/^[0-9a-fA-F]{24}$/),
        kilo: z.number().min(0.5).max(10).optional(),
        pieces: z.number().min(1).max(100).optional(),
        quantity: z.number().min(1).max(10).default(1),
        custom_text: z.string().max(500).optional().or(z.literal("")),
        additional_description: z
          .string()
          .max(1000)
          .optional()
          .or(z.literal("")),
      })
    )
    .min(1),
  phone_number: z.string().regex(/^\+?[\d\s-()]{10,}$/),
  delivery_time: z.coerce.date().refine((d) => d > new Date(), {
    message: "delivery_time must be in the future",
  }),
  payment_proof_url: z.string().url(),
});

export const updateOrderValidation = z.object({
  status: z.enum(["pending", "accepted", "rejected", "completed"]).optional(),
  rejection_comment: z.string().max(1000).optional().or(z.literal("")),
  upfront_paid: z.number().min(0).optional(),
  total_price: z.number().min(0).optional(),
});

export const orderQueryValidation = z.object({
  status: z.enum(["pending", "accepted", "rejected", "completed"]).optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  user_id: objectIdSchema.optional(), // ✅ transformed into ObjectId
});
