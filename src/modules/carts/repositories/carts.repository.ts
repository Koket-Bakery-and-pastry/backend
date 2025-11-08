import { Types } from "mongoose";
import Cart, { ICart } from "../../../database/models/cart.model";
import { AddToCartDto, UpdateCartItemDto } from "../dtos/carts.dto";

// Carts repository placeholder.
export class CartRepository {
  async create(data: AddToCartDto): Promise<ICart> {
    const cartItem = new Cart(data);
    await cartItem.save();
    await cartItem.populate({
      path: "product_id",
      populate: [{ path: "category_id" }, { path: "subcategory_id" }],
    });
    return cartItem;
  }

  async findByUserAndProduct(
    userId: string,
    productId: string
  ): Promise<ICart | null> {
    return Cart.findOne({
      user_id: new Types.ObjectId(userId),
      product_id: new Types.ObjectId(productId),
    });
  }

  async findByUserId(userId: string): Promise<ICart[]> {
    return Cart.find({ user_id: new Types.ObjectId(userId) }).populate({
      path: "product_id",
      populate: [{ path: "category_id" }, { path: "subcategory_id" }],
    });
  }
  async findById(id: string): Promise<ICart | null> {
    return Cart.findById(id).populate({
      path: "product_id",
      populate: [{ path: "category_id" }, { path: "subcategory_id" }],
    });
  }

  async update(id: string, data: UpdateCartItemDto): Promise<ICart | null> {
    return Cart.findByIdAndUpdate(id, data, { new: true }).populate({
      path: "product_id",
      populate: [{ path: "category_id" }, { path: "subcategory_id" }],
    });
  }

  async delete(id: string): Promise<ICart | null> {
    const cartItem = await Cart.findByIdAndDelete(id);
    if (cartItem) {
      await cartItem.populate({
        path: "product_id",
        populate: [{ path: "category_id" }, { path: "subcategory_id" }],
      });
    }
    return cartItem;
  }

  async clearCart(userId: string) {
    return Cart.deleteMany({ user_id: new Types.ObjectId(userId) });
  }
}
