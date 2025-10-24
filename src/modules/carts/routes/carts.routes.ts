// Carts routes
import { Router } from "express";
import { CartController } from "../controllers/carts.controller";
import { authenticate } from "../../../core/middlewares/auth.middleware";

const router = Router();
const cartController = new CartController();

router.post("/", authenticate, cartController.addItemToCart);
router.get("/", authenticate, cartController.getUserCart);
// Register static routes before dynamic parameterized routes so strings
// like 'clear' aren't captured by the '/:id' param.
router.delete("/clear", authenticate, cartController.clearUserCart);
router.patch("/:id", authenticate, cartController.updateCartItem);
router.delete("/:id", authenticate, cartController.deteleCartItem);

export default router;
