import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  image_url?: string;
  images?: string[]; // Array of image URLs
  category_id: Types.ObjectId;
  subcategory_id: Types.ObjectId;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  image_url: { type: String }, // Keep for backward compatibility (main image)
  images: [{ type: String }], // Array of additional images
  category_id: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  subcategory_id: {
    type: Schema.Types.ObjectId,
    ref: "Subcategory",
    required: true,
  },
  description: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

productSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

const Product = model<IProduct>("Product", productSchema);
export default Product;
