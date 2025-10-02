import { Schema, model, Document, Types } from "mongoose";

export interface ICustomCake extends Document {
  user_id: Types.ObjectId;
  description: string;
  reference_image_url?: string;
  kilo: number;
  amount: number;
  cake_type: string;
  estimated_price: number;
  custom_text: string;
  created_at: Date;
}

const customCakeSchema = new Schema<ICustomCake>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true },
  reference_image_url: { type: String },
  kilo: { type: Number },
  amount: { type: Number },
  cake_type: { type: String },
  estimated_price: { type: Number },
  custom_text: { type: String },
  created_at: { type: Date, default: Date.now },
});

const CustomCake = model<ICustomCake>("CustomCake", customCakeSchema);
export default CustomCake;
