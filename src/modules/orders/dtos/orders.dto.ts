import { Types } from "mongoose";
// Multer types can vary; use `any` here to avoid type mismatch with installed multer version
type MulterFile = any;

export interface OrderItemDTO {
  _id?: string; // ID of existing order item to mark as ordered
  product_id?: string;
  kilo?: number;
  pieces?: number;
  quantity: number;
  custom_text?: string;
  additional_description?: string;
}

export interface CreateOrderItemDTO {
  user_id?: Types.ObjectId;
  product_id: string;
  kilo?: number;
  pieces?: number;
  quantity: number;
  custom_text?: string;
  additional_description?: string;
}

export interface UpdateOrderItemDTO {
  kilo?: number;
  pieces?: number;
  quantity?: number;
  custom_text?: string;
  additional_description?: string;
}

export interface OrderItemResponseDTO {
  _id: Types.ObjectId;
  product_id: Types.ObjectId;
  user_id: Types.ObjectId;
  kilo?: number;
  pieces?: number;
  quantity: number;
  custom_text?: string;
  additional_description?: string;
  is_ordered: boolean;
  created_at: Date;
}

export interface CreateOrderDTO {
  order_items: OrderItemDTO[];
  user_id?: Types.ObjectId;
  phone_number: string;
  delivery_time: Date;
  payment_proof_url: string;
  upfront_paid?: number;
  total_price?: number;
}
export interface CreateOrderWithFileDTO extends CreateOrderDTO {
  payment_proof_file: MulterFile;
}

export interface UpdateOrderDTO {
  status?: "pending" | "accepted" | "rejected" | "completed";
  rejection_comment?: string;
  upfront_paid?: number;
  total_price?: number;
}

export interface OrderResponseDTO {
  _id: Types.ObjectId;
  order_items: OrderItemResponseDTO[]; // Can be IDs or populated items
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

export interface OrderWithItemsDTO extends OrderResponseDTO {
  order_items_details: any[]; // Populated order items
  user_details?: any; // Populated user info
}
