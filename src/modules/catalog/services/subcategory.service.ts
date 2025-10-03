import { SubcategoryRepository } from "../repositories/subcategory.repository";
import { CategoryRepository } from "../repositories/category.repository"; // Need to check if category exists
import {
  CreateSubcategoryDto,
  UpdateSubcategoryDto,
} from "../dtos/subcategory.dto";
import { ISubcategory } from "../../../database/models/subcategory.model";
import { HttpError } from "../../../core/errors/HttpError";

export class SubcategoryService {
  private subcategoryRepository: SubcategoryRepository;
  private categoryRepository: CategoryRepository;

  constructor() {
    this.subcategoryRepository = new SubcategoryRepository();
    this.categoryRepository = new CategoryRepository();
  }

  /**
   * Creates a new subcategory.
   * @param data The subcategory creation data.
   * @returns The created subcategory.
   * @throws HttpError if parent category does not exist or subcategory with same name already exists in category.
   */
  async createSubcategory(data: CreateSubcategoryDto): Promise<ISubcategory> {
    const parentCategory = await this.categoryRepository.findById(
      data.category_id
    );
    if (!parentCategory) {
      throw new HttpError(
        404,
        `Parent Category with ID '${data.category_id}' not found.`
      );
    }

    const existingSubcategory =
      await this.subcategoryRepository.findByNameAndCategory(
        data.name,
        data.category_id
      );
    if (existingSubcategory) {
      throw new HttpError(
        409,
        `Subcategory with name '${data.name}' already exists in this category.`
      );
    }

    return this.subcategoryRepository.create(data);
  }

  /**
   * Retrieves all subcategories, optionally filtered by category_id.
   * @param categoryId Optional ID of the parent category.
   * @returns An array of subcategories.
   */
  async getAllSubcategories(categoryId?: string): Promise<ISubcategory[]> {
    if (categoryId) {
      const parentCategory = await this.categoryRepository.findById(categoryId);
      if (!parentCategory) {
        throw new HttpError(
          404,
          `Parent Category with ID '${categoryId}' not found.`
        );
      }
    }
    return this.subcategoryRepository.findAll(categoryId);
  }

  /**
   * Retrieves a single subcategory by its ID.
   * @param id The ID of the subcategory.
   * @returns The subcategory.
   * @throws HttpError if subcategory is not found.
   */
  async getSubcategoryById(id: string): Promise<ISubcategory> {
    const subcategory = await this.subcategoryRepository.findById(id);
    if (!subcategory) {
      throw new HttpError(404, `Subcategory with ID '${id}' not found.`);
    }
    return subcategory;
  }

  /**
   * Updates an existing subcategory.
   * @param id The ID of the subcategory to update.
   * @param data The update data.
   * @returns The updated subcategory.
   * @throws HttpError if subcategory is not found, parent category does not exist, or name conflicts.
   */
  async updateSubcategory(
    id: string,
    data: UpdateSubcategoryDto
  ): Promise<ISubcategory> {
    // Check if new parent category exists if category_id is being updated
    if (data.category_id) {
      const parentCategory = await this.categoryRepository.findById(
        data.category_id
      );
      if (!parentCategory) {
        throw new HttpError(
          404,
          `New parent Category with ID '${data.category_id}' not found.`
        );
      }
    }

    // If name or category_id is being updated, check for uniqueness conflict
    if (data.name || data.category_id) {
      const currentSubcategory = await this.subcategoryRepository.findById(id);
      if (!currentSubcategory) {
        throw new HttpError(
          404,
          `Subcategory with ID '${id}' not found for update.`
        );
      }

      const targetCategoryId =
        data.category_id || currentSubcategory.category_id.toString();
      const targetName = data.name || currentSubcategory.name;

      const existingSubcategory =
        await this.subcategoryRepository.findByNameAndCategory(
          targetName,
          targetCategoryId
        );

      if (existingSubcategory && String(existingSubcategory._id) !== id) {
        throw new HttpError(
          409,
          `Subcategory with name '${targetName}' already exists in the target category.`
        );
      }
    }

    const updatedSubcategory = await this.subcategoryRepository.update(
      id,
      data
    );
    if (!updatedSubcategory) {
      throw new HttpError(
        404,
        `Subcategory with ID '${id}' not found for update.`
      );
    }
    return updatedSubcategory;
  }

  /**
   * Deletes a subcategory.
   * @param id The ID of the subcategory to delete.
   * @returns The deleted subcategory.
   * @throws HttpError if subcategory is not found.
   */
  async deleteSubcategory(id: string): Promise<ISubcategory> {
    const deletedSubcategory = await this.subcategoryRepository.delete(id);
    if (!deletedSubcategory) {
      throw new HttpError(
        404,
        `Subcategory with ID '${id}' not found for deletion.`
      );
    }
    // TODO: Add logic to handle associated products if a subcategory is deleted
    return deletedSubcategory;
  }
}
