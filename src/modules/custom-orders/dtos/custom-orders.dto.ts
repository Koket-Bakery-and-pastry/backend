import { Types } from "mongoose";
import { File as MulterFile } from "multer";

export interface CreateCustomCakeDTO {
  user_id: Types.ObjectId;
  product_id: string; // Base product ID
  description: string;
  reference_image_file?: MulterFile;
  reference_image_url?: string;
  kilo?: number;
  pieces?: number;
  quantity: number;
  custom_text?: string;
  additional_description?: string;
  estimated_price: number;
}

export interface UpdateCustomCakeDTO {
  description?: string;
  reference_image_url?: string;
  kilo?: number;
  pieces?: number;
  quantity?: number;
  custom_text?: string;
  additional_description?: string;
  estimated_price?: number;
}

export interface CustomCakeResponseDTO {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  product_id: Types.ObjectId;
  description: string;
  reference_image_url?: string;
  kilo?: number;
  pieces?: number;
  quantity: number;
  custom_text?: string;
  additional_description?: string;
  estimated_price: number;
  created_at: Date;
}

export interface CreateCustomOrderDTO {
  custom_cake_id: Types.ObjectId;
  user_id: Types.ObjectId;
  phone_number: string;
  total_price: number;
  upfront_paid: number;
  payment_proof_url: string;
  delivery_time: Date;
}

export interface CreateCustomOrderWithFileDTO
  extends Omit<CreateCustomOrderDTO, "user_id"> {
  payment_proof_file: MulterFile;
  user_id: Types.ObjectId;
}

export interface UpdateCustomOrderDTO {
  status?: "pending" | "accepted" | "rejected" | "completed";
  rejection_comment?: string;
  upfront_paid?: number;
  total_price?: number;
}

export interface CustomOrderResponseDTO {
  _id: Types.ObjectId;
  custom_cake_id: Types.ObjectId;
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

export interface CustomOrderWithDetailsDTO extends CustomOrderResponseDTO {
  custom_cake_details: CustomCakeResponseDTO & {
    product_details?: any; // Populated product info
  };
  user_details?: {
    _id: Types.ObjectId;
    name: string;
    email: string;
  };
}

export interface CustomOrderQueryDTO {
  status?: "pending" | "accepted" | "rejected" | "completed";
  start_date?: Date;
  end_date?: Date;
  page?: number;
  limit?: number;
  user_id?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
