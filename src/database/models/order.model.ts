import { Schema, model, Document, Types } from "mongoose";
import { IOrderItem } from "./orderItem.model";

export interface IOrder extends Document {
  order_items: Types.ObjectId[];
  user_id: Types.ObjectId;
  phone_number: string;
  total_price: number;
  upfront_paid: number;
  payment_proof_url: string;
  delivery_time: Date;
  status: "pending" | "accepted" | "rejected" | "completed";
  rejection_comment?: string;
  created_at: Date;
  updated_at: Date;
}

const orderSchema = new Schema<IOrder>({
  order_items: [
    { type: Schema.Types.ObjectId, required: true, ref: "OrderItem" },
  ],

  user_id: { type: Schema.Types.ObjectId, ref: "User" },
  phone_number: { type: String, required: true },
  total_price: { type: Number, required: true },
  upfront_paid: { type: Number, required: true },
  payment_proof_url: { type: String },
  delivery_time: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed"],
    default: "pending",
  },
  rejection_comment: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

orderSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

const Order = model<IOrder>("Order", orderSchema);
export default Order;
