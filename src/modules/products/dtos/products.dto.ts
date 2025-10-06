export interface PieceOptionDto {
  label?: string;
  pieces: number;
  price: number;
}

export interface CreateProductDto {
  name: string;
  image_url?: string;
  category_id: string;
  subcategory_id: string;
  description?: string;
  kilo_to_price_map?: Record<string, number>;
  is_pieceable: boolean;
  // legacy single-piece count (optional)
  pieces?: number;
  // new: multiple piece-size options (optional)
  piece_options?: PieceOptionDto[];
  upfront_payment?: number;
}

export interface UpdateProductDto {
  name?: string;
  image_url?: string;
  category_id?: string;
  subcategory_id?: string;
  description?: string;
  kilo_to_price_map?: Record<string, number>;
  is_pieceable?: boolean;
  pieces?: number;
  piece_options?: PieceOptionDto[];
  upfront_payment?: number;
}
