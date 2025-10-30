import { Schema, model, Document, Types } from "mongoose";

export interface IAnalyticsSnapshot extends Document {
  date: Date;
  period: "daily" | "weekly" | "monthly";
  total_orders: number;
  total_revenue: number;
  total_upfront_collected: number;
  orders_by_status: {
    pending: number;
    accepted: number;
    rejected: number;
    completed: number;
  };
  top_categories: Array<{
    category_id: Types.ObjectId;
    category_name: string;
    order_count: number;
    revenue: number;
  }>;
  top_products: Array<{
    product_id: Types.ObjectId;
    product_name: string;
    order_count: number;
    revenue: number;
  }>;
  customer_metrics: {
    new_customers: number;
    returning_customers: number;
    total_customers: number;
  };
  average_rating: number;
  upcoming_deliveries: number;
  created_at: Date;
}

const analyticsSnapshotSchema = new Schema<IAnalyticsSnapshot>({
  date: { type: Date, required: true },
  period: {
    type: String,
    enum: ["daily", "weekly", "monthly"],
    required: true,
  },
  total_orders: { type: Number, default: 0 },
  total_revenue: { type: Number, default: 0 },
  total_upfront_collected: { type: Number, default: 0 },
  orders_by_status: {
    pending: { type: Number, default: 0 },
    accepted: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
  },
  top_categories: [
    {
      category_id: { type: Schema.Types.ObjectId, ref: "Category" },
      category_name: String,
      order_count: Number,
      revenue: Number,
    },
  ],
  top_products: [
    {
      product_id: { type: Schema.Types.ObjectId, ref: "Product" },
      product_name: String,
      order_count: Number,
      revenue: Number,
    },
  ],
  customer_metrics: {
    new_customers: { type: Number, default: 0 },
    returning_customers: { type: Number, default: 0 },
    total_customers: { type: Number, default: 0 },
  },
  average_rating: { type: Number, default: 0 },
  upcoming_deliveries: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

export const AnalyticsSnapshot = model<IAnalyticsSnapshot>(
  "AnalyticsSnapshot",
  analyticsSnapshotSchema
);
export default AnalyticsSnapshot;
