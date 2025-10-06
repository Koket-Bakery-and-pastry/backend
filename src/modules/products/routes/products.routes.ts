import { Router } from "express";
import { ProductController } from "../controllers/products.controller";

const router = Router();
const productController = new ProductController();

router.post("/", productController.createProduct);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

export default router;
