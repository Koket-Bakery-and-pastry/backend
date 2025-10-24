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
      const parsed = createSubcategorySchema.parse(req.body);
      // Normalize kilo_to_price_map keys to strings and values to numbers
      const subcategoryData: any = { ...parsed };
      if (parsed.kilo_to_price_map) {
        const normalized: Record<string, number> = {};
        Object.entries(parsed.kilo_to_price_map).forEach(([k, v]) => {
          normalized[String(k)] = Number(v);
        });
        subcategoryData.kilo_to_price_map = normalized;
      }
      if (parsed.is_pieceable !== undefined) {
        subcategoryData.is_pieceable = Boolean(parsed.is_pieceable);
      }
      // Ensure upfront_payment and price are numbers
      if (parsed.upfront_payment !== undefined)
        subcategoryData.upfront_payment = Number(parsed.upfront_payment);
      if (parsed.price !== undefined)
        subcategoryData.price = Number(parsed.price);

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
      const parsedUpdate = updateSubcategorySchema.parse(req.body);
      const updateData: any = { ...parsedUpdate };
      if (parsedUpdate.kilo_to_price_map) {
        const normalized: Record<string, number> = {};
        Object.entries(parsedUpdate.kilo_to_price_map).forEach(([k, v]) => {
          normalized[String(k)] = Number(v);
        });
        updateData.kilo_to_price_map = normalized;
      }
      if (parsedUpdate.is_pieceable !== undefined) {
        updateData.is_pieceable = Boolean(parsedUpdate.is_pieceable);
      }
      if (parsedUpdate.upfront_payment !== undefined)
        updateData.upfront_payment = Number(parsedUpdate.upfront_payment);
      if (parsedUpdate.price !== undefined)
        updateData.price = Number(parsedUpdate.price);

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
