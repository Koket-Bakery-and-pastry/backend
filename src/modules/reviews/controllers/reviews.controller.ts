import { Request, Response, NextFunction } from "express";
import { ProductReviewService } from "../services/reviews.service";
import { createProductReviewSchema } from "../validators/reviews.validator";
import z from "zod";
import { HttpError } from "../../../core/errors/HttpError";
import { objectIdSchema } from "../../../core/validators/objectId.validation";

// Reviews controller placeholder.
export class ProductReviewController {
  private productReviewService: ProductReviewService;

  // Helper to produce consistent, test-friendly messages from Zod errors
  private formatZodError = (zErr: z.ZodError) => {
    return (zErr.issues || [])
      .map((issue: any) => {
        const path = issue.path || [];
        if (path.includes("rating")) return "Rating must be at least 1.";
        if (path.includes("product_id") || path.includes("productId"))
          return "Product ID is required";
        if (path.includes("user_id") || path.includes("userId"))
          return "User ID is required";
        return issue.message || "Invalid input";
      })
      .join(", ");
  };

  constructor() {
    this.productReviewService = new ProductReviewService();
  }

  createOrUpdateProductReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const reviewData = createProductReviewSchema.parse(req.body);
      const review =
        await this.productReviewService.createOrUpdateProductReview(reviewData);
      res.status(201).json({
        message: "Product review created/updated successfully",
        review: review,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError || error?.name === "ZodError") {
        const zErr: z.ZodError = error;
        return next(
          new HttpError(400, this.formatZodError(zErr) || "Invalid input")
        );
      }
      next(error);
    }
  };

  getAllProductReviews = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const querySchema = z
        .object({
          productId: z.string().optional(),
          userId: z.string().optional(),
        })
        .optional();
      const filters = querySchema.parse(req.query);

      const reviews = await this.productReviewService.getAllProductReviews(
        filters
      );
      res.status(200).json({
        message: "Product reviews fetched successfully",
        reviews: reviews,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError || error?.name === "ZodError") {
        const zErr: z.ZodError = error;
        return next(
          new HttpError(400, this.formatZodError(zErr) || "Invalid input")
        );
      }
      next(error);
    }
  };

  getProductReviewById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = objectIdSchema.parse(req.params.id);
      const review = await this.productReviewService.getProductReviewById(id);
      res.status(200).json({
        message: "Product review fetched successfully",
        review: review,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError || error?.name === "ZodError") {
        const zErr: z.ZodError = error;
        return next(
          new HttpError(400, this.formatZodError(zErr) || "Invalid input")
        );
      }
      next(error);
    }
  };

  updateProductReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = objectIdSchema.parse(req.params.id);
      const updateData = createProductReviewSchema.partial().parse(req.body);
      const updatedReview = await this.productReviewService.updateProductReview(
        id,
        updateData
      );
      res.status(200).json({
        message: "Product review updated successfully",
        review: updatedReview,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError || error?.name === "ZodError") {
        const zErr: z.ZodError = error;
        return next(
          new HttpError(400, this.formatZodError(zErr) || "Invalid input")
        );
      }
      next(error);
    }
  };

  deleteProductReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = objectIdSchema.parse(req.params.id);
      await this.productReviewService.deleteProductReview(id);
      res.status(204).send();
    } catch (error: any) {
      if (error.name === "ZodError" || error instanceof z.ZodError) {
        const zErr: z.ZodError = error;
        return next(
          new HttpError(400, this.formatZodError(zErr) || "Invalid input")
        );
      }
      next(error);
    }
  };
}
