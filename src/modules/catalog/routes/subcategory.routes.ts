import { Router } from "express";
import { SubcategoryController } from "../controllers/subcategory.controller";
import {
  authenticate,
  authorize,
} from "../../../core/middlewares/auth.middleware";

const router = Router();
const subcategoryController = new SubcategoryController();

// Public routes
// GET /api/v1/subcategories - Get all subcategories (optional: filter by categoryId)
router.get("/", subcategoryController.getAllSubcategories);

// GET /api/v1/subcategories/:id - Get a single subcategory by ID
router.get("/:id", subcategoryController.getSubcategoryById);

// Admin only routes
// POST /api/v1/subcategories - Create a new subcategory
router.post(
  "/",
  authenticate,
  authorize("admin"),
  subcategoryController.createSubcategory
);

// PUT /api/v1/subcategories/:id - Update a subcategory by ID
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  subcategoryController.updateSubcategory
);

// DELETE /api/v1/subcategories/:id - Delete a subcategory by ID
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  subcategoryController.deleteSubcategory
);

export default router;
