// Reviews routes placeholder.
import { Router } from "express";
import { ProductReviewController } from "../controllers/reviews.controller";
const router = Router();
const productReviewController = new ProductReviewController();

router.post("/", productReviewController.createOrUpdateProductReview);
router.get("/", productReviewController.getAllProductReviews);
router.get("/:id", productReviewController.getProductReviewById);
router.patch("/:id", productReviewController.updateProductReview); // Changed to PATCH for semantic partial update
router.delete("/:id", productReviewController.deleteProductReview);

export default router;
