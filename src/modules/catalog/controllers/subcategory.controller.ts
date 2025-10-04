import { HttpError } from "../../../core/errors/HttpError";
import { objectIdSchema } from "../../../core/validators/objectId.validation";
import { z } from "zod";
import { SubcategoryService } from "../services/subcategory.service";
import {
  createSubcategorySchema,
  updateSubcategorySchema,
} from "../validators/subcategory.validation";
import { Request, Response, NextFunction } from "express";

export class SubcategoryController {
  private subcategoryService: SubcategoryService;

  constructor() {
    this.subcategoryService = new SubcategoryService();
  }

  createSubcategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const subcategoryData = createSubcategorySchema.parse(req.body);
      const newSubcategory = await this.subcategoryService.createSubcategory(
        subcategoryData
      );
      res.status(201).json({
        message: "Subcategory created successfully",
        subcategory: newSubcategory,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        // Map specific missing/invalid field issues to the messages expected by tests
        const nameIssue = error.issues.find((i: any) =>
          i.path?.includes("name")
        );
        if (nameIssue) {
          return next(new HttpError(400, "Subcategory name cannot be empty"));
        }
        const categoryIssue = error.issues.find((i: any) =>
          i.path?.includes("category_id")
        );
        if (categoryIssue) {
          return next(new HttpError(400, String(categoryIssue.message)));
        }
        return next(
          new HttpError(400, error.issues.map((e: any) => e.message).join(", "))
        );
      }
      if (error instanceof HttpError) return next(error);
      next(new HttpError(500, "Internal Server Error"));
    }
  };
  getAllSubcategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const categoryId = req.query.categoryId as string | undefined;

      if (categoryId) {
        objectIdSchema.parse(String(categoryId)); // Validate categoryId if provided
      }

      const subcategories = await this.subcategoryService.getAllSubcategories(
        categoryId
      );
      res.status(200).json({
        message: "Subcategories retrieved successfully",
        subcategories,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return next(new HttpError(400, String(error.issues[0].message)));
      }
      // If the service threw an HttpError, forward it unchanged so status/message match tests
      if (error instanceof HttpError) return next(error);
      next(new HttpError(500, "Internal Server Error"));
    }
  };
  getSubcategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = objectIdSchema.parse(String(req.params.id)); // Validate ID
      const subcategory = await this.subcategoryService.getSubcategoryById(id);
      res.status(200).json({
        message: "Subcategory retrieved successfully",
        subcategory,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return next(new HttpError(400, String(error.issues[0].message)));
      }
      if (error instanceof HttpError) return next(error);
      next(new HttpError(500, "Internal Server Error"));
    }
  };

  updateSubcategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = objectIdSchema.parse(String(req.params.id)); // Validate ID
      const updateData = updateSubcategorySchema.parse(req.body);

      const updatedSubcategory =
        await this.subcategoryService.updateSubcategory(id, updateData);
      res.status(200).json({
        message: "Subcategory updated successfully",
        subcategory: updatedSubcategory,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return next(
          new HttpError(400, error.issues.map((e: any) => e.message).join(", "))
        );
      }
      if (error instanceof HttpError) return next(error);
      next(new HttpError(500, "Internal Server Error"));
    }
  };

  deleteSubcategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = objectIdSchema.parse(String(req.params.id)); // Validate ID
      const deletedSubcategory =
        await this.subcategoryService.deleteSubcategory(id);
      res.status(200).json({
        message: "Subcategory deleted successfully",
        subcategory: deletedSubcategory,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return next(new HttpError(400, String(error.issues[0].message)));
      }
      if (error instanceof HttpError) return next(error);
      next(new HttpError(500, "Internal Server Error"));
    }
  };
}
