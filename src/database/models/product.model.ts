import { Schema, model, Document, Types } from "mongoose";

export interface IPieceOption {
  label?: string;
  pieces: number; // how many pieces (e.g., 6, 8)
  price: number; // price for that piece unit/portion
}

export interface IProduct extends Document {
  name: string;
  image_url?: string;
  category_id: Types.ObjectId;
  subcategory_id: Types.ObjectId;
  description?: string;
  kilo_to_price_map?: Record<string, number> | undefined;
  is_pieceable: boolean;
  pieces?: number;
  piece_options?: IPieceOption[];
  upfront_payment?: number;
  created_at: Date;
  updated_at: Date;
}

const pieceOptionSchema = new Schema<IPieceOption>(
  {
    label: { type: String },
    pieces: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

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
  kilo_to_price_map: {
    type: Schema.Types.Mixed,
    required: function (this: any) {
      // kilo_to_price_map is required only when product is NOT pieceable
      return !this.is_pieceable;
    },
    default: {},
    validate: {
      validator: function (val: any) {
        // When product is sold by kilo (is_pieceable=false), ensure there is a non-empty map
        if (this.is_pieceable) return true;
        return val && typeof val === "object" && Object.keys(val).length > 0;
      },
      message:
        "kilo_to_price_map is required when product is not pieceable and must contain at least one entry.",
    },
  },
  is_pieceable: { type: Boolean, default: false },
  pieces: {
    type: Number,
    required: function (this: any) {
      // pieces is required only when product IS pieceable
      return this.is_pieceable;
    },
  },
  piece_options: { type: [pieceOptionSchema], default: undefined }, // optional array
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
