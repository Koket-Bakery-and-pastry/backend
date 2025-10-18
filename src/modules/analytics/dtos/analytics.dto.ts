import { Types } from "mongoose";

export interface AnalyticsQueryDTO {
  start_date?: Date;
  end_date?: Date;
  period?: "daily" | "weekly" | "monthly";
  category_id?: string;
  product_id?: string;
}

export interface AnalyticsResponseDTO {
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
    average_rating: number;
  }>;
  customer_metrics: {
    new_customers: number;
    returning_customers: number;
    total_customers: number;
  };
  average_rating: number;
  upcoming_deliveries: number;
  revenue_trend: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface DashboardOverviewDTO {
  today: AnalyticsResponseDTO;
  weekly: AnalyticsResponseDTO;
  monthly: AnalyticsResponseDTO;
  comparison: {
    revenue_growth: number;
    order_growth: number;
    customer_growth: number;
  };
}

export interface ProductPerformanceDTO {
  product_id: Types.ObjectId;
  product_name: string;
  total_orders: number;
  total_revenue: number;
  average_rating: number;
  review_count: number;
  conversion_rate: number;
}

export interface CategoryPerformanceDTO {
  category_id: Types.ObjectId;
  category_name: string;
  total_orders: number;
  total_revenue: number;
  product_count: number;
  average_rating: number;
}
