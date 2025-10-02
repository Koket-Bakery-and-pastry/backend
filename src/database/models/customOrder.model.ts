import { Schema, model, Document, Types } from "mongoose";

export interface ICustomOrder extends Document {
  custom_cake_id: Types.ObjectId;
  user_id: Types.ObjectId;
  total_price: number;
  upfront_paid?: number;
  payment_proof_url: string;
  delivery_time: Date;
  status: "pending" | "accepted" | "rejected" | "completed";
  rejection_comment?: string;
  created_at: Date;
  updated_at: Date;
}

const customOrderSchema = new Schema<ICustomOrder>({
  custom_cake_id: {
    type: Schema.Types.ObjectId,
    ref: "CustomCake",
    required: true,
  },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  total_price: { type: Number, required: true },
  upfront_paid: { type: Number },
  payment_proof_url: { type: String, required: true },
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

customOrderSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

const CustomOrder = model<ICustomOrder>("CustomOrder", customOrderSchema);
export default CustomOrder;
