import { Schema, model, Document, Types } from "mongoose";

export interface IProductReview extends Document {
  product_id: Types.ObjectId;
  user_id: Types.ObjectId;
  rating: number;
  comment?: string;
  created_at: Date;
}

const productReviewSchema = new Schema<IProductReview>({
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  created_at: { type: Date, default: Date.now },
});

const ProductReview = model<IProductReview>(
  "ProductReview",
  productReviewSchema
);
export default ProductReview;
