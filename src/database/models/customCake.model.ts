import { Schema, model, Document, Types } from "mongoose";

export interface ICustomCake extends Document {
  user_id: Types.ObjectId;
  product_id: Types.ObjectId;
  description: string;
  reference_image_url?: string;
  kilo?: number;
  pieces?: number;
  quantity: number;
  custom_text?: string;
  additional_description?: string;
  estimated_price: number;
  created_at: Date;
}

const customCakeSchema = new Schema<ICustomCake>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  description: { type: String, required: true },
  reference_image_url: { type: String },
  kilo: { type: Number },
  pieces: { type: Number },
  quantity: { type: Number, required: true, default: 1 },
  custom_text: { type: String },
  additional_description: { type: String },
  estimated_price: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
});

const CustomCake = model<ICustomCake>("CustomCake", customCakeSchema);
export default CustomCake;
