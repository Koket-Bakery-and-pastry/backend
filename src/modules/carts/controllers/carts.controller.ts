import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { CartService } from "../services/carts.service";
import { Http2ServerRequest } from "http2";
import { HttpError } from "../../../core/errors/HttpError";
import {
  addToCartSchema,
  updateCartItemSchema,
} from "../validators/carts.validator";
import { objectIdSchema } from "../../../core/validators/objectId.validation";
import { findUserByGoogleId } from "../../auth/repositories/auth.repository";

// Carts controller placeholder.
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export class CartController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  addItemToCart = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;
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
      res.status(201).json({
        message: "Cart item added/updated successfully",
        cartItem: cartItem,
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        const msg = error.issues.map((i) => i.message).join(", ");
        return next(new HttpError(400, msg));
      }
      next(error);
    }
  };

  getUserCart = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpError(401, "Authentication required to view cart.");
      }

      const cartItems = await this.cartService.getUserCart(userId);
      res.status(200).json({
        message: "User cart retrieved successfully",
        cartItems: cartItems,
      });
    } catch (error) {
      next(error);
    }
  };

  updateCartItem = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;
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
      res.status(200).json({
        message: "Cart Item updated successfully",
        cartItem: updatedCartItem,
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
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;
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
      res.status(200).json({
        message: "Cart item deleted successfully",
        cartItem: deletedCartItem,
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
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id;
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
