import { HttpError } from "../../../core/errors/HttpError";
import { objectIdSchema } from "../../../core/validators/objectId.validation";
import { CategoryService } from "../services/category.service";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validation";
import { Request, Response, NextFunction } from "express";

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  /**
   * Creates a new Category
   * POST /api/v1/categories
   */
  createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categoryData = createCategorySchema.parse(req.body);
      const newCategory = await this.categoryService.createCategory(
        categoryData
      );
      res.status(201).json({
        message: "Category created successfully",
        category: newCategory,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return next(
          new HttpError(400, error.errors.map((e: any) => e.message).join(", "))
        );
      }
      next(error);
    }
  };

  /**
   * RETRIEVES all categories
   * GET /api/v1/categories
   */
  getAllCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const categories = await this.categoryService.getAllCategories();
      res.status(200).json({
        message: "Categories retrieved successfully",
        categories,
      });
    } catch (error) {
      next(error);
    }
  };
  /**
   * RETRIEVES a category by ID
   * GET /api/v1/categories/:id
   */
  getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = objectIdSchema.parse(req.params.id); // Validate ID
      const category = await this.categoryService.getCategoryById(id);
      res.status(200).json({
        message: "Category retrieved successfully",
        category,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return next(
          new HttpError(400, error.errors.map((e: any) => e.message).join(", "))
        );
      }
      next(error);
    }
  };

  /**
   * UPDATES a category by ID
   * PUT /api/v1/categories/:id
   */
  updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = objectIdSchema.parse(req.params.id); // Validate ID

      const updateData = updateCategorySchema.parse(req.body); // Validate body
      const updatedCategory = await this.categoryService.updateCategory(
        id,
        updateData
      );
      res.status(200).json({
        message: "Category updated successfully",
        category: updatedCategory,
      });
    } catch (error: any) {
      if (error.name == "ZodError") {
        return next(
          new HttpError(400, error.errors.map((e: any) => e.message).join(", "))
        );
      }
      next(error);
    }
  };

  /**
   * DELETES a category by ID
   * DELETE /api/v1/categories/:id
   * */
  deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = objectIdSchema.parse(req.params.id); // Validate ID
      const deletedCategory = await this.categoryService.deleteCategory(id);
      res.status(200).json({
        message: "Category deleted successfully",
        category: deletedCategory,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return next(
          new HttpError(400, `Invalid Category ID: ${error.errors[0].message}`)
        );
      }
      next(error);
    }
  };
}
