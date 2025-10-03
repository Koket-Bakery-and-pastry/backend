// Catalog routes placeholder.
import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";

const router = Router();
const categoryController = new CategoryController();

// POST /api/v1/categories - Create a new category
router.post("/", categoryController.createCategory);

// GET /api/v1/categories - Get all categories
router.get("/", categoryController.getAllCategories);

// GET /api/v1/categories/:id - Get a single category by ID
router.get("/:id", categoryController.getCategoryById);

// PUT /api/v1/categories/:id - Update a category by ID
router.put("/:id", categoryController.updateCategory);

// DELETE /api/v1/categories/:id - Delete a category by ID
router.delete("/:id", categoryController.deleteCategory);

export default router;
