import { Schema, model, Document, Types } from "mongoose";

export interface IOrderItem extends Document {
  product_id: Types.ObjectId;
  kilo?: number;
  pieces?: number;
  quantity: number;
  price: number;
  custom_text?: string;
  additional_description?: string;
  created_at: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  kilo: { type: Number },
  pieces: { type: Number, default: 1 },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },
  custom_text: { type: String },
  additional_description: { type: String },
  created_at: { type: Date, default: Date.now },
});

const OrderItem = model<IOrderItem>("OrderItem", orderItemSchema);
export default OrderItem;
