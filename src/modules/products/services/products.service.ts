import { ProductRepository } from "../repositories/products.repository";
import { CategoryRepository } from "../../catalog/repositories/category.repository";
import { SubcategoryRepository } from "../../catalog/repositories/subcategory.repository";
import { CreateProductDto, UpdateProductDto } from "../dtos/products.dto";
import { IProduct } from "../../../database/models/product.model";
import { HttpError } from "../../../core/errors/HttpError";
import fs from "fs";
import path from "path";

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
   * Retrieves a single product by its ID with populated category and subcategory details.
   * Also fetches related products from the same subcategory/category.
   * @param id The ID of the product.
   * @returns The product with related products.
   * @throws HttpError if product is not found.
   */
  async getProductById(
    id: string
  ): Promise<IProduct & { related_products?: IProduct[] }> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new HttpError(404, `Product with ID '${id}' not found.`);
    }

    // Extract category and subcategory IDs (they might be populated objects)
    const categoryId =
      typeof product.category_id === "object" && product.category_id !== null
        ? (product.category_id as any)._id.toString()
        : product.category_id.toString();

    const subcategoryId =
      typeof product.subcategory_id === "object" &&
      product.subcategory_id !== null
        ? (product.subcategory_id as any)._id.toString()
        : product.subcategory_id.toString();

    // Fetch related products
    const relatedProducts = await this.productRepository.findRelatedProducts(
      id,
      categoryId,
      subcategoryId
    );

    // Attach related products to the product object
    const productWithRelated = product.toObject ? product.toObject() : product;
    return {
      ...productWithRelated,
      related_products: relatedProducts,
    };
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

    // Extract IDs from potentially populated fields
    const existingCategoryId =
      typeof existingProduct.category_id === "object" &&
      existingProduct.category_id !== null
        ? (existingProduct.category_id as any)._id.toString()
        : existingProduct.category_id.toString();

    const existingSubcategoryId =
      typeof existingProduct.subcategory_id === "object" &&
      existingProduct.subcategory_id !== null
        ? (existingProduct.subcategory_id as any)._id.toString()
        : existingProduct.subcategory_id.toString();

    // Validate parent entities if category_id or subcategory_id is being updated
    const targetCategoryId = updateData.category_id || existingCategoryId;
    const targetSubcategoryId =
      updateData.subcategory_id || existingSubcategoryId;

    if (updateData.category_id || updateData.subcategory_id) {
      await this.validateParentEntities(targetCategoryId, targetSubcategoryId);
    }

    // Check for uniqueness conflict if name, category_id, or subcategory_id is changing
    const targetName = updateData.name || existingProduct.name;

    if (
      targetName !== existingProduct.name ||
      targetCategoryId !== existingCategoryId ||
      targetSubcategoryId !== existingSubcategoryId
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
      throw new HttpError(
        404,
        `Product with ID '${id}' not found for update (after existing check).`
      );
    }

    // If the update included a new local image_url, attempt to delete the old file
    try {
      const newImage = (updateData as any).image_url;
      const oldImage = existingProduct.image_url;
      const isLocal = (p?: string) =>
        !!p && (/^\//.test(p) || /^uploads\//.test(p));
      if (isLocal(newImage) && isLocal(oldImage) && oldImage !== newImage) {
        // Resolve to uploads directory only to avoid path traversal
        const uploadsDir = path.resolve(process.cwd(), "uploads");
        const oldRel = oldImage.replace(/^\//, "");
        const oldPath = path.resolve(
          uploadsDir,
          oldRel.replace(/^uploads\//, "")
        );
        if (oldPath.startsWith(uploadsDir)) {
          fs.stat(oldPath, (err, stats) => {
            if (!err && stats.isFile()) {
              fs.unlink(oldPath, (uErr) => {
                if (uErr) {
                  // eslint-disable-next-line no-console
                  console.warn("Failed to remove old product image:", uErr);
                } else {
                  // eslint-disable-next-line no-console
                  console.log("Removed old product image:", oldPath);
                }
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn(
        "Error while attempting to cleanup old image:",
        e && (e as any).message ? (e as any).message : e
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
    return deletedProduct;
  }
}
