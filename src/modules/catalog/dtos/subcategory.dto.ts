export interface CreateSubcategoryDto {
  category_id: string;
  name: string;
  status?: "available" | "coming_soon";
}

export interface UpdateSubcategoryDto {
  category_id?: string;
  name?: string;
  status?: "available" | "coming_soon";
}
