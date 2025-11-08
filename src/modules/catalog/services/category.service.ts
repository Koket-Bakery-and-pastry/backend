import { SubcategoryService } from "./subcategory.service";
import { SubcategoryRepository } from "./../repositories/subcategory.repository";
import { HttpError } from "../../../core/errors/HttpError";
import { ICategory } from "../../../database/models/category.model";
import { CreateCategoryDto, UpdateCategoryDto } from "../dtos/category.dto";
import { CategoryRepository } from "../repositories/category.repository";
import { ca } from "zod/v4/locales";

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  /**
   * Creates a new category.
   * @param data - The data for the new category.
   * @return The created category.
   * @throws Error if the category could not be created.
   */
  async createCategory(data: CreateCategoryDto): Promise<ICategory> {
    const existingCategory = await this.categoryRepository.findByName(
      data.name
    );
    if (existingCategory) {
      throw new HttpError(409, "Category with this name already exists");
    }
    const newCategory = await this.categoryRepository.create(data);
    return newCategory;
  }

  /**
   * Retrieves all categories.
   * @return An array of categories.
   */
  async getAllCategories(): Promise<ICategory[]> {
    let categories = await this.categoryRepository.findAll();
    const subcategoryService = new SubcategoryService();

    let subcategories: any[] = [];
    for (const category of categories) {
      const id = String((category as any)._id ?? (category as any).id);

      try {
        const subcategory =
          await subcategoryService.getSubcategoriesByCategoryId(id);
        subcategories.push(...subcategory);
      } catch (error) {
        // If there's an error fetching subcategories, we can log it or handle it as needed.
        // For now, we'll just continue without adding subcategories.
      }
    }

    // Attach subcategories to their respective categories
    categories = categories.map((category) => {
      const categoryId = String((category as any)._id ?? (category as any).id);
      const relatedSubcategories = subcategories.filter(
        (sub) =>
          String((sub as any).category_id ?? (sub as any).categoryId) ===
          categoryId
      );
      return {
        ...category.toObject(),
        subcategories: relatedSubcategories,
      };
    });

    return categories;
  }

  /**
   * Retrieves a category by its ID.
   * @param id - The ID of the category.
   * @return The category if found, otherwise null.
   */
  async getCategoryById(id: string): Promise<ICategory | null> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new HttpError(404, "Category not found");
    }
    return category;
  }

  /**
   * Updates a category by its ID.
   * @param id - The ID of the category to update.
   * @param data - The updated data for the category.
   * @return The updated category if found, otherwise null.
   * @throws Error if the category could not be updated.
   */
  async updateCategory(
    id: string,
    data: UpdateCategoryDto
  ): Promise<ICategory | null> {
    if (data.name) {
      const existingCategory = await this.categoryRepository.findByName(
        data.name
      );
      if (
        existingCategory &&
        (existingCategory._id as { toString(): string }).toString() !== id
      ) {
        throw new HttpError(409, "Category with this name already exists");
      }
    }

    const updatedCategory = await this.categoryRepository.update(id, data);
    if (!updatedCategory) {
      throw new HttpError(404, "Category not found");
    }
    return updatedCategory;
  }

  /**
   * Deletes a category by its ID.
   * @param id - The ID of the category to delete.
   * @return The deleted category if found, otherwise null.
   * @throws Error if the category could not be deleted.
   */
  async deleteCategory(id: string): Promise<ICategory | null> {
    const deletedCategory = await this.categoryRepository.delete(id);
    if (!deletedCategory) {
      throw new HttpError(404, "Category not found");
    }
    // TODO: Handle cascading deletions or reassignments for products linked to this category.
    return deletedCategory;
  }
}
