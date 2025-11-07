import { Schema, model, Document, Types } from "mongoose";

export interface ISubcategory extends Document {
  _id: Types.ObjectId | string;
  category_id: Types.ObjectId | string;
  name: string;
  status: "available" | "coming_soon";
  kilo_to_price_map?: Record<string, number> | undefined;
  upfront_payment: number;
  price: number;
  is_pieceable?: boolean;
  created_at: Date;
  updated_at: Date;
}

const subcategorySchema = new Schema<ISubcategory>({
  category_id: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["available", "coming_soon"],
    default: "available",
  },
  kilo_to_price_map: {
    type: Object,
    default: undefined,
  },
  upfront_payment: {
    type: Number,
    required: true,
  },
  is_pieceable: { type: Boolean, default: false },
  price: {
    type: Number,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const Subcategory = model<ISubcategory>("Subcategory", subcategorySchema);
export default Subcategory;
