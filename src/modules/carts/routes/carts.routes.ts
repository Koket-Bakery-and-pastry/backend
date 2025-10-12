// Carts routes
import { Router } from "express";
import { CartController } from "../controllers/carts.controller";

const router = Router();
const cartController = new CartController();

router.post("/", cartController.addItemToCart);
router.get("/", cartController.getUserCart);
// Register static routes before dynamic parameterized routes so strings
// like 'clear' aren't captured by the '/:id' param.
router.delete("/clear", cartController.clearUserCart);
router.patch("/:id", cartController.updateCartItem);
router.delete("/:id", cartController.deteleCartItem);

export default router;
