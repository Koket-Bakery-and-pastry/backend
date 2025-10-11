// Carts DTO placeholder.
export interface AddToCartDto {
  user_id: string;
  product_id: string;
  quantity: number;
  kilo?: number; // Optional, required if product is sold by kilo
  pieces?: number; // Optional, required if product is pieceable
  custom_text?: string;
  additional_description?: string;
}

export interface UpdateCartItemDto {
  quantity?: number;
  kilo?: number; // Optional, required if product is sold by kilo
  pieces?: number; // Optional, required if product is pieceable
  custom_text?: string;
  additional_description?: string;
}
