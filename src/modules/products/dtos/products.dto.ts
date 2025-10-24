export interface CreateProductDto {
  name: string;
  image_url?: string;
  category_id: string;
  subcategory_id: string;
  description?: string;
}

export interface UpdateProductDto {
  name?: string;
  image_url?: string;
  category_id?: string;
  subcategory_id?: string;
  description?: string;
}
