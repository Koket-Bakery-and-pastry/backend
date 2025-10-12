import { Types } from "mongoose";
import Cart, { ICart } from "../../../database/models/cart.model";
import { AddToCartDto, UpdateCartItemDto } from "../dtos/carts.dto";

// Carts repository placeholder.
export class CartRepository {
  async create(data: AddToCartDto): Promise<ICart> {
    const cartItem = new Cart(data);
    await cartItem.save();
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
    return Cart.find({ user_id: new Types.ObjectId(userId) }).populate(
      "product_id"
    );
  }
  async findById(id: string): Promise<ICart | null> {
    return Cart.findById(id).populate("product_id"); // Populate product details
  }

  async update(id: string, data: UpdateCartItemDto): Promise<ICart | null> {
    return Cart.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<ICart | null> {
    return Cart.findByIdAndDelete(id);
  }

  async clearCart(userId: string) {
    return Cart.deleteMany({ user_id: new Types.ObjectId(userId) });
  }
}
