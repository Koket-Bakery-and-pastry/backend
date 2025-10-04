import { Router } from "express";
import { SubcategoryController } from "../controllers/subcategory.controller";

const router = Router();
const subcategoryController = new SubcategoryController();

// POST /api/v1/subcategories - Create a new subcategory
router.post("/", subcategoryController.createSubcategory);

// GET /api/v1/subcategories - Get all subcategories (optional: filter by categoryId)
router.get("/", subcategoryController.getAllSubcategories);

// GET /api/v1/subcategories/:id - Get a single subcategory by ID
router.get("/:id", subcategoryController.getSubcategoryById);

// PUT /api/v1/subcategories/:id - Update a subcategory by ID
router.put("/:id", subcategoryController.updateSubcategory);

// DELETE /api/v1/subcategories/:id - Delete a subcategory by ID
router.delete("/:id", subcategoryController.deleteSubcategory);

export default router;
