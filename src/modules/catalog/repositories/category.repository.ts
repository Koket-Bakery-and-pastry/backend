import Category, { ICategory } from "../../../database/models/category.model";
import { CreateCategoryDto, UpdateCategoryDto } from "../dtos/category.dto";

export class CategoryRepository {
  /**
   * Creates a new category.
   * @param data The category data.
   * @returns The created category document.
   */
  async create(data: CreateCategoryDto): Promise<ICategory> {
    const category = new Category(data);
    await category.save();
    return category;
  }

  /**
   * Finds all categories.
   * @returns An array of category documents.
   */
  async findAll(): Promise<ICategory[]> {
    return Category.find().exec();
  }

  /**
   * Finds a category by its ID.
   * @param id The ID of the category.
   * @returns The category document, or null if not found.
   */
  async findById(id: string): Promise<ICategory | null> {
    return Category.findById(id).exec();
  }

  /**
   * Finds a category by its name.
   * @param name The name of the category.
   * @returns The category document, or null if not found.
   */
  async findByName(name: string): Promise<ICategory | null> {
    return Category.findOne({ name }).exec();
  }

  /**
   * Updates an existing category.
   * @param id The ID of the category to update.
   * @param data The update data.
   * @returns The updated category document, or null if not found.
   */
  async update(id: string, data: UpdateCategoryDto): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(id, data, { new: true }).exec(); // `new: true` returns the updated document
  }

  /**
   * Deletes a category by its ID.
   * @param id The ID of the category to delete.
   * @returns The deleted category document, or null if not found.
   */
  async delete(id: string): Promise<ICategory | null> {
    return Category.findByIdAndDelete(id).exec();
  }
}
