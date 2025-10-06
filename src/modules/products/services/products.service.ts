import { ProductRepository } from "../repositories/products.repository";
import { CategoryRepository } from "../../catalog/repositories/category.repository";
import { SubcategoryRepository } from "../../catalog/repositories/subcategory.repository";
import { CreateProductDto, UpdateProductDto } from "../dtos/products.dto";
import { IProduct } from "../../../database/models/product.model";
import { HttpError } from "../../../core/errors/HttpError";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/products.validator";

export class ProductService {
  private productRepository: ProductRepository;
  private categoryRepository: CategoryRepository;
  private subcategoryRepository: SubcategoryRepository;

  constructor() {
    this.productRepository = new ProductRepository();
    this.categoryRepository = new CategoryRepository();
    this.subcategoryRepository = new SubcategoryRepository();
  }

  /**
   * Validates if a category and subcategory exist and if the subcategory belongs to the category.
   * @param categoryId The ID of the category.
   * @param subcategoryId The ID of the subcategory.
   * @throws HttpError if category or subcategory not found, or mismatch.
   */
  private async validateParentEntities(
    categoryId: string,
    subcategoryId: string
  ): Promise<void> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new HttpError(404, `Category with ID '${categoryId}' not found.`);
    }

    const subcategory = await this.subcategoryRepository.findById(
      subcategoryId
    );
    if (!subcategory) {
      throw new HttpError(
        404,
        `Subcategory with ID '${subcategoryId}' not found.`
      );
    }

    // Ensure the subcategory actually belongs to the specified category
    if (subcategory.category_id.toString() !== categoryId) {
      throw new HttpError(
        400,
        `Subcategory with ID '${subcategoryId}' does not belong to Category with ID '${categoryId}'.`
      );
    }
  }

  /**
   * Creates a new product.
   * @param data The product creation data.
   * @returns The created product.
   * @throws HttpError if parent entities are invalid or product name conflicts.
   */
  async createProduct(data: CreateProductDto): Promise<IProduct> {
    // 1. Validate parent category and subcategory
    await this.validateParentEntities(data.category_id, data.subcategory_id);

    // 2. Check for unique product name within category/subcategory path
    const existingProduct =
      await this.productRepository.findByNameAndCategoryAndSubcategory(
        data.name,
        data.category_id,
        data.subcategory_id
      );
    if (existingProduct) {
      throw new HttpError(
        409,
        `Product with name '${data.name}' already exists in this category/subcategory.`
      );
    }

    // 3. Create product
    return this.productRepository.create(data);
  }

  /**
   * Retrieves all products, optionally filtered by categoryId or subcategoryId.
   * @param filters Optional filters.
   * @returns An array of products.
   */
  async getAllProducts(filters?: {
    categoryId?: string;
    subcategoryId?: string;
  }): Promise<IProduct[]> {
    if (filters?.categoryId && filters.subcategoryId) {
      await this.validateParentEntities(
        filters.categoryId,
        filters.subcategoryId
      );
    } else if (filters?.categoryId) {
      const category = await this.categoryRepository.findById(
        filters.categoryId
      );
      if (!category) {
        throw new HttpError(
          404,
          `Category with ID '${filters.categoryId}' not found.`
        );
      }
    } else if (filters?.subcategoryId) {
      const subcategory = await this.subcategoryRepository.findById(
        filters.subcategoryId
      );
      if (!subcategory) {
        throw new HttpError(
          404,
          `Subcategory with ID '${filters.subcategoryId}' not found.`
        );
      }
    }
    return this.productRepository.findAll(filters);
  }

  /**
   * Retrieves a single product by its ID.
   * @param id The ID of the product.
   * @returns The product.
   * @throws HttpError if product is not found.
   */
  async getProductById(id: string): Promise<IProduct> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new HttpError(404, `Product with ID '${id}' not found.`);
    }
    return product;
  }

  /**
   * Updates an existing product.
   * @param id The ID of the product to update.
   * @param updateData The update data.
   * @returns The updated product.
   * @throws HttpError if product not found, parent entities invalid, or name conflicts.
   */
  async updateProduct(
    id: string,
    updateData: UpdateProductDto
  ): Promise<IProduct> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new HttpError(404, `Product with ID '${id}' not found for update.`);
    }

    // Merge existing data with update data to perform full validation
    const combinedData = {
      ...existingProduct.toObject(), // Convert Mongoose document to plain object
      ...updateData,
      category_id: (
        updateData.category_id || existingProduct.category_id
      ).toString(),
      subcategory_id: (
        updateData.subcategory_id || existingProduct.subcategory_id
      ).toString(),
      // Ensure kilo_to_price_map is handled correctly, it's a Map in existingProduct
      kilo_to_price_map:
        updateData.kilo_to_price_map ||
        (existingProduct.kilo_to_price_map instanceof Map
          ? Object.fromEntries(existingProduct.kilo_to_price_map)
          : existingProduct.kilo_to_price_map),
    };

    // Re-validate the combined data using the create schema to enforce all rules
    try {
      createProductSchema.parse(combinedData);
    } catch (error: any) {
      if (error?.name === "ZodError" || error instanceof Error) {
        const errs = error.errors ?? error.issues ?? [];
        const messages = Array.isArray(errs)
          ? errs.map((e: any) => e.message || String(e)).join(", ")
          : error.message || String(error);
        throw new HttpError(400, `Validation error during update: ${messages}`);
      }
      throw error;
    }

    // Validate parent entities if category_id or subcategory_id is updated or if it's implicitly part of the new state
    const targetCategoryId = (
      updateData.category_id || existingProduct.category_id
    ).toString();
    const targetSubcategoryId = (
      updateData.subcategory_id || existingProduct.subcategory_id
    ).toString();

    if (
      updateData.category_id ||
      updateData.subcategory_id ||
      existingProduct.category_id.toString() !== targetCategoryId ||
      existingProduct.subcategory_id.toString() !== targetSubcategoryId
    ) {
      await this.validateParentEntities(targetCategoryId, targetSubcategoryId);
    }

    // Check for uniqueness conflict if name, category_id, or subcategory_id is changing
    const targetName = updateData.name || existingProduct.name;

    if (
      targetName !== existingProduct.name ||
      targetCategoryId !== existingProduct.category_id.toString() ||
      targetSubcategoryId !== existingProduct.subcategory_id.toString()
    ) {
      const conflictingProduct =
        await this.productRepository.findByNameAndCategoryAndSubcategory(
          targetName,
          targetCategoryId,
          targetSubcategoryId
        );

      if (
        conflictingProduct &&
        (
          conflictingProduct as { _id: { toString(): string } }
        )._id.toString() !== id
      ) {
        throw new HttpError(
          409,
          `Product with name '${targetName}' already exists in the target category/subcategory.`
        );
      }
    }

    const updatedProduct = await this.productRepository.update(id, updateData);
    if (!updatedProduct) {
      // This check is mostly for paranoia, as we already checked existingProduct
      throw new HttpError(
        404,
        `Product with ID '${id}' not found for update (after existing check).`
      );
    }
    return updatedProduct;
  }

  /**
   * Deletes a product.
   * @param id The ID of the product to delete.
   * @returns The deleted product.
   * @throws HttpError if product is not found.
   */
  async deleteProduct(id: string): Promise<IProduct> {
    const deletedProduct = await this.productRepository.delete(id);
    if (!deletedProduct) {
      throw new HttpError(
        404,
        `Product with ID '${id}' not found for deletion.`
      );
    }
    // TODO: Add logic to handle associated carts/orders if a product is deleted
    return deletedProduct;
  }
}
