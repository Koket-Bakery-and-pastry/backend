import { Schema, model, Document, Types } from "mongoose";

export interface ISubcategory extends Document {
  _id: Types.ObjectId | string;
  category_id: Types.ObjectId | string;
  name: string;
  status: "available" | "coming_soon";
  created_at: Date;
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
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Subcategory = model<ISubcategory>("Subcategory", subcategorySchema);
export default Subcategory;
