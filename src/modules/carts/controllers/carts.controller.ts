import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { CartService } from "../services/carts.service";
import { AuthRequest } from "../../../core/middlewares/auth.middleware";
import { HttpError } from "../../../core/errors/HttpError";
import {
  addToCartSchema,
  updateCartItemSchema,
} from "../validators/carts.validator";
import { objectIdSchema } from "../../../core/validators/objectId.validation";

export class CartController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  // Enrich cart item's product with pricing info from subcategory
  private enrichCartItemWithPricing(cartItem: any): any {
    const item = cartItem.toObject ? cartItem.toObject() : cartItem;

    if (item.product_id && typeof item.product_id === "object") {
      const product = item.product_id;
      const subcat = product.subcategory_id;

      if (subcat && typeof subcat === "object") {
        // Add pricing fields to product for backward compatibility
        product.kilo_to_price_map = subcat.kilo_to_price_map || {};
        product.upfront_payment = subcat.upfront_payment;
        product.is_pieceable = subcat.is_pieceable ?? false;
      }
    }

    return item;
  }

  addItemToCart = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.userId?.toString();
      if (!userId) {
        throw new HttpError(401, "Authentication required to manage cart.");
      }

      if (!req.body.product_id) {
        throw new HttpError(400, "Product ID is required.");
      }
      const cartItemData = addToCartSchema.parse({
        ...req.body,
        user_id: userId,
      });
      const cartItem = await this.cartService.addItemToCart(
        cartItemData as any
      );
      const enriched = this.enrichCartItemWithPricing(cartItem);
      res.status(201).json({
        message: "Cart item added/updated successfully",
        cartItem: enriched,
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        const msg = error.issues.map((i) => i.message).join(", ");
        return next(new HttpError(400, msg));
      }
      next(error);
    }
  };

  getUserCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId?.toString();
      if (!userId) {
        throw new HttpError(401, "Authentication required to view cart.");
      }

      const cartItems = await this.cartService.getUserCart(userId);
      const enriched = cartItems.map((item) =>
        this.enrichCartItemWithPricing(item)
      );
      res.status(200).json({
        message: "User cart retrieved successfully",
        cartItems: enriched,
      });
    } catch (error) {
      next(error);
    }
  };

  updateCartItem = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.userId?.toString();
      if (!userId) {
        throw new HttpError(401, "Authentication required to update cart.");
      }
      const cartItemId = objectIdSchema.parse(req.params.id);
      const updateData = updateCartItemSchema.parse(req.body);

      const updatedCartItem = await this.cartService.updateCartItem(
        cartItemId,
        userId,
        updateData
      );
      const enriched = this.enrichCartItemWithPricing(updatedCartItem);
      res.status(200).json({
        message: "Cart Item updated successfully",
        cartItem: enriched,
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        const msg = error.issues.map((i) => i.message).join(",");
        return next(new HttpError(400, msg));
      }
      next(error);
    }
  };

  deteleCartItem = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.userId?.toString();
      if (!userId) {
        throw new HttpError(
          401,
          "Authentication required to delete cart Item."
        );
      }
      const cartItemId = objectIdSchema.parse(req.params.id);

      const deletedCartItem = await this.cartService.deleteCartItem(
        cartItemId,
        userId
      );
      const enriched = this.enrichCartItemWithPricing(deletedCartItem);
      res.status(200).json({
        message: "Cart item deleted successfully",
        cartItem: enriched,
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return next(
          new HttpError(400, `Invalid Cart Item ID: ${error.issues[0].message}`)
        );
      }
      next(error);
    }
  };

  clearUserCart = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.userId?.toString();
      if (!userId) {
        throw new HttpError(401, "Authentication required to clear cart.");
      }

      await this.cartService.clearUserCart(userId);
      res.status(200).json({
        message: "User cart cleared successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
