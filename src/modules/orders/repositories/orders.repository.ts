import { Types } from "mongoose";
import Order from "../../../database/models/order.model";
import Product from "../../../database/models/product.model";
import OrderItem from "../../../database/models/orderItem.model";
import {
  CreateOrderDTO,
  CreateOrderItemDTO,
  OrderItemResponseDTO,
  OrderResponseDTO,
  UpdateOrderDTO,
  UpdateOrderItemDTO,
} from "../dtos/orders.dto";

export class OrdersRepository {
  // helper to convert populated product_id into `product`
  private mapOrder(orderDoc: any): OrderResponseDTO {
    const obj = orderDoc.toObject ? orderDoc.toObject() : orderDoc;
    if (Array.isArray(obj.order_items)) {
      obj.order_items = obj.order_items.map((item: any) => {
        // Handle case where item might be just an ObjectId (not populated)
        if (
          !item ||
          typeof item !== "object" ||
          item._bsontype === "ObjectId"
        ) {
          return item;
        }
        if (item.product_id && typeof item.product_id === "object") {
          item.product = item.product_id;
          delete item.product_id;
        }
        return item;
      });
    }
    return obj as OrderResponseDTO;
  }

  async create(data: CreateOrderDTO): Promise<OrderResponseDTO> {
    const orderItemIds: Types.ObjectId[] = [];

    if (data.order_items && Array.isArray(data.order_items)) {
      for (const item of data.order_items) {
        if (item._id) {
          // Use existing order item - just mark it as ordered
          const existingId = new Types.ObjectId(item._id);
          await OrderItem.findByIdAndUpdate(existingId, { is_ordered: true });
          orderItemIds.push(existingId);
        } else {
          // Create new order item
          const orderItem = new OrderItem({
            product_id: item.product_id,
            user_id: data.user_id,
            kilo: item.kilo,
            pieces: item.pieces,
            quantity: item.quantity || 1,
            custom_text: item.custom_text,
            additional_description: item.additional_description,
            is_ordered: true,
          });
          await orderItem.save();
          orderItemIds.push(orderItem._id as Types.ObjectId);
        }
      }
    }

    // Create the order with the OrderItem IDs
    const order = new Order({
      ...data,
      order_items: orderItemIds,
    });
    console.log("Saving order:", order);
    await order.save();

    // populate the product document (not just its id) for each order item
    await order.populate({
      path: "order_items",
      populate: { path: "product_id", model: Product.modelName },
    });
    await Order.populate(order, { path: "user_id", model: "User" });
    return this.mapOrder(order);
  }

  async findById(id: string): Promise<OrderResponseDTO | null> {
    const order = await Order.findById(id)
      .populate({
        path: "order_items",
        populate: { path: "product_id", model: Product.modelName },
      })
      .exec();
    await Order.populate(order, { path: "user_id", model: "User" });
    return order ? this.mapOrder(order) : null;
  }

  async update(
    id: string,
    data: Partial<UpdateOrderDTO>
  ): Promise<OrderResponseDTO | null> {
    const order = await Order.findByIdAndUpdate(id, data, { new: true })
      .populate({
        path: "order_items",
        populate: { path: "product_id", model: Product.modelName },
      })
      .exec();
    await Order.populate(order, { path: "user_id", model: "User" });
    return order ? this.mapOrder(order) : null;
  }

  async findAll(): Promise<OrderResponseDTO[]> {
    const orders = await Order.find()
      .populate({
        path: "order_items",
        populate: { path: "product_id", model: Product.modelName },
      })
      .exec();
    await Order.populate(orders, { path: "user_id", model: "User" });
    return orders.map((order) => this.mapOrder(order));
  }

  async getOrdersByUserId(userId: string): Promise<OrderResponseDTO[]> {
    const orders = await Order.find({ user_id: userId })
      .populate({
        path: "order_items",
        populate: { path: "product_id", model: Product.modelName },
      })
      .exec();
    await Order.populate(orders, { path: "user_id", model: "User" });
    return orders.map((order) => this.mapOrder(order));
  }
  async getAllOrders(): Promise<OrderResponseDTO[]> {
    const orders = await Order.find()
      .populate({
        path: "order_items",
        populate: { path: "product_id", model: Product.modelName },
      })
      .exec();
    await Order.populate(orders, { path: "user_id", model: "User" });
    return orders.map((order) => this.mapOrder(order));
  }

  async filterOrdersByStatus(status: string): Promise<OrderResponseDTO[]> {
    const orders = await Order.find({ status })
      .populate({
        path: "order_items",
        populate: { path: "product_id", model: Product.modelName },
      })
      .exec();
    await Order.populate(orders, { path: "user_id", model: "User" });
    return orders.map((order) => this.mapOrder(order));
  }
}

export class OrderItemRepository {
  // Helper to convert populated product_id into `product`
  private mapOrderItem(itemDoc: any): OrderItemResponseDTO {
    const obj = itemDoc.toObject ? itemDoc.toObject() : itemDoc;
    if (obj.product_id && typeof obj.product_id === "object") {
      obj.product = obj.product_id;
      delete obj.product_id;
    }
    return obj as OrderItemResponseDTO;
  }

  async create(data: CreateOrderItemDTO): Promise<OrderItemResponseDTO> {
    const orderItem = new OrderItem(data);
    await orderItem.save();
    await orderItem.populate("product_id");
    await orderItem.populate({
      path: "product_id",
      populate: [
        { path: "category_id", model: "Category" },
        { path: "subcategory_id", model: "Subcategory" },
        { path: "user_id", model: "User" },
      ],
    });
    await OrderItem.populate(orderItem, { path: "user_id", model: "User" });
    return this.mapOrderItem(orderItem);
  }

  async findById(id: string): Promise<OrderItemResponseDTO | null> {
    const orderItem = await OrderItem.findById(id)
      .populate("product_id")
      .exec();
    await orderItem.populate({
      path: "product_id",
      populate: [
        { path: "category_id", model: "Category" },
        { path: "subcategory_id", model: "Subcategory" },
        { path: "user_id", model: "User" },
      ],
    });
    await OrderItem.populate(orderItem, { path: "user_id", model: "User" });
    return orderItem ? this.mapOrderItem(orderItem) : null;
  }

  async update(
    id: string,
    data: UpdateOrderItemDTO
  ): Promise<OrderItemResponseDTO | null> {
    const orderItem = await OrderItem.findByIdAndUpdate(id, data, {
      new: true,
    })
      .populate("product_id")
      .exec();
    await orderItem.populate({
      path: "product_id",
      populate: [
        { path: "category_id", model: "Category" },
        { path: "subcategory_id", model: "Subcategory" },
        { path: "user_id", model: "User" },
      ],
    });

    return orderItem ? this.mapOrderItem(orderItem) : null;
  }

  async findAllByUserId(
    userId: Types.ObjectId
  ): Promise<OrderItemResponseDTO[]> {
    // Only return items that are not yet ordered (pending cart items)
    const orderItems = await OrderItem.find({
      user_id: userId,
      is_ordered: false,
    })
      .populate("product_id")
      .exec();
    await OrderItem.populate(orderItems, {
      path: "product_id",
      populate: [
        { path: "category_id", model: "Category" },
        { path: "subcategory_id", model: "Subcategory" },
      ],
    });

    await OrderItem.populate(orderItems, { path: "user_id", model: "User" });
    return orderItems.map((item) => this.mapOrderItem(item));
  }

  async markAsOrdered(itemIds: Types.ObjectId[]): Promise<void> {
    await OrderItem.updateMany(
      { _id: { $in: itemIds } },
      { $set: { is_ordered: true } }
    ).exec();
  }

  async markAllUserItemsAsOrdered(userId: Types.ObjectId): Promise<void> {
    await OrderItem.updateMany(
      { user_id: userId, is_ordered: false },
      { $set: { is_ordered: true } }
    ).exec();
  }

  async delete(id: string): Promise<boolean> {
    const orderItem = await OrderItem.findByIdAndDelete(id).exec();
    return !!orderItem;
  }
}
