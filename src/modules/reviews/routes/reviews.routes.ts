import { Router } from "express";
import { ProductReviewController } from "../controllers/reviews.controller";
import { authenticate } from "../../../core/middlewares/auth.middleware";

const router = Router();
const productReviewController = new ProductReviewController();

// Public routes
router.get("/", productReviewController.getAllProductReviews);
router.get("/:id", productReviewController.getProductReviewById);

// Authenticated routes
router.post(
  "/",
  authenticate,
  productReviewController.createOrUpdateProductReview
);
router.patch("/:id", authenticate, productReviewController.updateProductReview);
router.delete(
  "/:id",
  authenticate,
  productReviewController.deleteProductReview
);

export default router;
