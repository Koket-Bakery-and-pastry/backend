import { model, Schema } from "mongoose";

export interface IContact extends Document {
  name: string;
  email?: string;
  phone_number?: string;
  message: string;
  created_at: Date;
}

const contactSchema = new Schema<IContact>({
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone_number: { type: String, trim: true },
  message: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});
const Contact = model<IContact>("Contact", contactSchema);
export default Contact;
