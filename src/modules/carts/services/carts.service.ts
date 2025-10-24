import { Http } from "winston/lib/winston/transports";
import { HttpError } from "../../../core/errors/HttpError";
import { ICart } from "../../../database/models/cart.model";
import { IProduct } from "../../../database/models/product.model";
import { UserRepository } from "../../users/repositories/users.repository";
import { AddToCartDto, UpdateCartItemDto } from "../dtos/carts.dto";
import { ProductRepository } from "../../products/repositories/products.repository";
import { CartRepository } from "../repositories/carts.repository";
import { SubcategoryRepository } from "../../catalog/repositories/subcategory.repository";

// Carts service placeholder.
export class CartService {
  private cartRepository: CartRepository;
  private productRepository: ProductRepository; // Assuming a ProductRepository exists
  private userRepository: UserRepository; // Assuming a UserRepository exists
  private subcategoryRepository: SubcategoryRepository;

  constructor() {
    this.cartRepository = new CartRepository();
    this.productRepository = new ProductRepository();
    this.userRepository = new UserRepository();
    this.subcategoryRepository = new SubcategoryRepository();
  }

  private async validateProductItemOptions(
    product: IProduct,
    dto: AddToCartDto | UpdateCartItemDto
  ): Promise<void> {
    const hasKilo = typeof dto.kilo === "number" && dto.kilo > 0;
    const hasPieces = typeof dto.pieces === "number" && dto.pieces > 0;
    const hasQuantity = typeof dto.quantity === "number" && dto.quantity > 0;

    // Determine pricing mode from the product's subcategory
    const subcategoryId = (product as any).subcategory_id;
    const subcategory = await this.subcategoryRepository.findById(
      subcategoryId?.toString()
    );
    if (!subcategory) {
      throw new HttpError(
        404,
        `Subcategory for product '${product.name}' not found.`
      );
    }

    const kiloMap = subcategory.kilo_to_price_map || {};
    const isPieceable =
      typeof subcategory.is_pieceable === "boolean"
        ? subcategory.is_pieceable
        : !kiloMap || Object.keys(kiloMap).length === 0;

    if (isPieceable) {
      if (hasKilo) {
        throw new Error(
          "Kilo option is not applicable for pieceable products."
        );
      }
      if (!hasPieces && !hasQuantity) {
        throw new Error(
          "Either pieces or quantity must be provided for pieceable products."
        );
      }

      if (hasPieces && dto.pieces! <= 0)
        throw new HttpError(400, "Pieces must be greater than 0.");
      if (hasQuantity && dto.quantity! <= 0)
        throw new HttpError(400, "Quantity must be greater than 0.");
    } else {
      // Non-pieceable -> kilo-based
      if (hasPieces) {
        throw new Error(
          "Pieces option is not applicable for non-pieceable products."
        );
      }
      if (!hasKilo && !hasQuantity) {
        throw new Error(
          "Either kilo or quantity must be provided for non-pieceable products."
        );
      }
      if (hasKilo && dto.kilo! <= 0)
        throw new HttpError(400, "Kilo must be greater than 0.");
      if (hasQuantity && dto.quantity! <= 0)
        throw new HttpError(400, "Quantity must be greater than 0.");
      if (hasKilo && kiloMap) {
        const kiloKey = `${dto.kilo}kg`; // Assuming '1kg', '2kg' format
        if (!Object.prototype.hasOwnProperty.call(kiloMap, kiloKey)) {
          const available = Object.keys(kiloMap).length
            ? Object.keys(kiloMap).join(", ")
            : "none configured";
          throw new HttpError(
            400,
            `Invalid kilo value '${dto.kilo}kg' for product '${product.name}'. Available options: ${available}.`
          );
        }
      }
    }
  }

  async addItemToCart(data: AddToCartDto): Promise<ICart> {
    const user = await this.userRepository.findById(data.user_id);
    if (!user) {
      throw new HttpError(404, `User with ID '${data.user_id}' not found.`);
    }
    const productId =
      typeof data.product_id === "string"
        ? data.product_id
        : (data.product_id as any)?._id
        ? (data.product_id as any)._id.toString()
        : String(data.product_id as any);
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new HttpError(
        404,
        `Product with ID '${data.product_id}' not found.`
      );
    }

    // Determine pricing mode from the product's subcategory to guide updates
    const prodSubcatId = (product as any).subcategory_id;
    const prodSubcat = await this.subcategoryRepository.findById(
      prodSubcatId?.toString()
    );
    if (!prodSubcat) {
      throw new HttpError(
        404,
        `Subcategory for product '${product.name}' not found.`
      );
    }
    const prodKiloMap = prodSubcat.kilo_to_price_map || {};
    const prodIsPieceable =
      !prodKiloMap || Object.keys(prodKiloMap).length === 0;

    await this.validateProductItemOptions(product, data);
    const existingCartItem = await this.cartRepository.findByUserAndProduct(
      data.user_id,
      data.product_id
    );
    if (existingCartItem) {
      // If item already exists in cart, update its quantity/pieces/kilo
      const updatePayload: UpdateCartItemDto = {};
      if (prodIsPieceable) {
        updatePayload.pieces =
          data.pieces !== undefined ? data.pieces : existingCartItem.pieces;
        updatePayload.quantity =
          data.quantity !== undefined
            ? data.quantity
            : existingCartItem.quantity;
        if (
          updatePayload.pieces !== undefined &&
          updatePayload.quantity !== undefined
        ) {
          updatePayload.pieces = updatePayload.quantity = Math.max(
            updatePayload.pieces,
            updatePayload.quantity
          );
        } else if (updatePayload.pieces !== undefined) {
          updatePayload.quantity = updatePayload.pieces;
        } else if (updatePayload.quantity !== undefined) {
          updatePayload.pieces = updatePayload.quantity;
        }
      } else {
        // For non-pieceable, update kilo or quantity
        updatePayload.kilo =
          data.kilo !== undefined ? data.kilo : existingCartItem.kilo;
        updatePayload.quantity =
          data.quantity !== undefined
            ? data.quantity
            : existingCartItem.quantity;
      }
      updatePayload.custom_text =
        data.custom_text !== undefined
          ? data.custom_text
          : existingCartItem.custom_text;
      updatePayload.additional_description =
        data.additional_description !== undefined
          ? data.additional_description
          : existingCartItem.additional_description;

      const updatedCartItem = await this.cartRepository.update(
        existingCartItem._id.toString(),
        updatePayload
      );
      if (!updatedCartItem) {
        // Paranoid check
        throw new HttpError(500, "Failed to update existing cart item.");
      }
      return updatedCartItem;
    } else {
      // Create new item
      return this.cartRepository.create(data);
    }
  }

  async getUserCart(userId: string): Promise<ICart[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, `User with ID '${userId}' not found.`);
    }
    return this.cartRepository.findByUserId(userId);
  }

  async updateCartItem(
    cartItemId: string,
    userId: string,
    updateData: UpdateCartItemDto
  ): Promise<ICart> {
    const cartItem = await this.cartRepository.findById(cartItemId);
    if (!cartItem) {
      throw new HttpError(404, `Cart item with ID '${cartItemId}' not found.`);
    }
    if (cartItem.user_id.toString() !== userId) {
      throw new HttpError(
        403,
        "You are not authorized to update this cart item."
      );
    }
    const productId2 =
      typeof cartItem.product_id === "string"
        ? cartItem.product_id
        : (cartItem.product_id as any)?._id
        ? (cartItem.product_id as any)._id.toString()
        : String(cartItem.product_id as any);
    const product = await this.productRepository.findById(productId2);
    if (!product) {
      throw new HttpError(
        404,
        `Product with ID '${cartItem.product_id}' not found.`
      );
    }

    const combinedData = {
      kilo: updateData.kilo !== undefined ? updateData.kilo : cartItem.kilo,
      pieces:
        updateData.pieces !== undefined ? updateData.pieces : cartItem.pieces,
      quantity:
        updateData.quantity !== undefined
          ? updateData.quantity
          : cartItem.quantity,
      custom_text:
        updateData.custom_text !== undefined
          ? updateData.custom_text
          : cartItem.custom_text,
      additional_description:
        updateData.additional_description !== undefined
          ? updateData.additional_description
          : cartItem.additional_description,
    };
    await this.validateProductItemOptions(product, combinedData);

    // Determine pricing mode from product's subcategory for update behavior
    const prodSubcatId2 = (product as any).subcategory_id;
    const prodSubcat2 = await this.subcategoryRepository.findById(
      prodSubcatId2?.toString()
    );
    if (!prodSubcat2) {
      throw new HttpError(
        404,
        `Subcategory for product '${product.name}' not found.`
      );
    }
    const prodKiloMap2 = prodSubcat2.kilo_to_price_map || {};
    const prodIsPieceable2 =
      !prodKiloMap2 || Object.keys(prodKiloMap2).length === 0;

    const updatePayload: UpdateCartItemDto = {};
    if (prodIsPieceable2) {
      updatePayload.pieces =
        updateData.pieces !== undefined ? updateData.pieces : cartItem.pieces;
      updatePayload.quantity =
        updateData.quantity !== undefined
          ? updateData.quantity
          : cartItem.quantity;
      if (
        updatePayload.pieces !== undefined &&
        updatePayload.quantity !== undefined
      ) {
        updatePayload.pieces = updatePayload.quantity = Math.max(
          updatePayload.pieces,
          updatePayload.quantity
        );
      } else if (updatePayload.pieces !== undefined) {
        updatePayload.quantity = updatePayload.pieces;
      } else if (updatePayload.quantity !== undefined) {
        updatePayload.pieces = updatePayload.quantity;
      }
    } else {
      updatePayload.kilo =
        updateData.kilo !== undefined ? updateData.kilo : cartItem.kilo;
      updatePayload.quantity =
        updateData.quantity !== undefined
          ? updateData.quantity
          : cartItem.quantity;
    }
    updatePayload.custom_text =
      updateData.custom_text !== undefined
        ? updateData.custom_text
        : cartItem.custom_text;
    updatePayload.additional_description =
      updateData.additional_description !== undefined
        ? updateData.additional_description
        : cartItem.additional_description;

    const updatedCartItem = await this.cartRepository.update(
      cartItemId,
      updatePayload
    );
    if (!updatedCartItem) {
      throw new HttpError(500, "Failed to update cart Item unexpectedly.");
    }
    return updatedCartItem;
  }

  async deleteCartItem(cartItemId: string, userId: string): Promise<ICart> {
    const cartItem = await this.cartRepository.findById(cartItemId);
    if (!cartItem) {
      throw new HttpError(404, ` Cart Item with ID ${cartItemId} not found`);
    }
    if (cartItem.user_id.toString() != userId) {
      throw new HttpError(403, "Unauthorized: You do not own this cart item");
    }

    const deletedCartItem = await this.cartRepository.delete(cartItemId);
    if (!deletedCartItem) {
      throw new HttpError(402, "Unauthorized: You do not own this cart item.");
    }

    return deletedCartItem;
  }

  async clearUserCart(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, `User with Id ${userId} not found`);
    }
    await this.cartRepository.clearCart(userId);
  }
}
