import { Router } from "express";
import authRoutes from "../../modules/auth/routes/auth.routes";
import productRoutes from "../../modules/products/routes/products.routes";
import userRoutes from "../../modules/users/routes/users.routes";

const router = Router();

// Define API routes for v1
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/users", userRoutes);
export default router;
