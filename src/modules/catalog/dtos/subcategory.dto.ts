export interface CreateSubcategoryDto {
  category_id: string;
  name: string;
  status?: "available" | "coming_soon";
  // Map like { "0.5kg": 300, "1kg": 550 }
  kilo_to_price_map?: Record<string, number>;
  // upfront payment amount or percentage (number)
  upfront_payment: number;
  // optional base price (for single-piece or default price)
  price?: number;
  // whether this subcategory uses piece-based products (true) or kilo-based (false)
  is_pieceable?: boolean;
}

export interface UpdateSubcategoryDto {
  category_id?: string;
  name?: string;
  status?: "available" | "coming_soon";
  kilo_to_price_map?: Record<string, number>;
  upfront_payment?: number;
  price?: number;
  is_pieceable?: boolean;
}
