import { Schema, model, Document, Types } from "mongoose";

export interface ICart extends Document {
  user_id: Types.ObjectId;
  product_id: Types.ObjectId;
  kilo: number;
  pieces?: number;
  quantity: number;
  custom_text: string;
  additional_description?: string;
  created_at: Date;
}

const cartSchema = new Schema<ICart>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  kilo: { type: Number, required: true },
  pieces: { type: Number, default: 1 },
  quantity: { type: Number, default: 1 },
  custom_text: { type: String },
  additional_description: { type: String },
  created_at: { type: Date, default: Date.now },
});

const Cart = model<ICart>("Cart", cartSchema);
export default Cart;
