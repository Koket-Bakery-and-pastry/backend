import z from "zod";

export const createContactSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty."),
  email: z.string().trim().email("Invalid email address.").optional(),
  phone_number: z.string().trim().optional(),
  message: z.string().trim().min(1, "Message cannot be empty."),
});
