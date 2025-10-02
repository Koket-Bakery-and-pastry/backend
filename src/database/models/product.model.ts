import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  image_url?: string;
  category_id: Types.ObjectId;
  subcategory_id: Types.ObjectId;
  description?: string;
  kilo_to_price_map: Record<string, number>;
  is_pieceable: boolean;
  pieces?: number;
  upfront_payment?: number;
  created_at: Date;
  updated_at: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  image_url: { type: String },
  category_id: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  subcategory_id: {
    type: Schema.Types.ObjectId,
    ref: "Subcategory",
    required: true,
  },
  description: { type: String },
  kilo_to_price_map: { type: Schema.Types.Mixed, required: true },
  is_pieceable: { type: Boolean, default: false },
  pieces: { type: Number },
  upfront_payment: { type: Number },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

productSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

const Product = model<IProduct>("Product", productSchema);
export default Product;
