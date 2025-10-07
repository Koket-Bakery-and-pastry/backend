// Reviews DTO placeholder.
export interface CreateProductReviewDto {
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
}

export interface UpdateProductReviewDto {
  rating?: number;
  comment?: string;
}
