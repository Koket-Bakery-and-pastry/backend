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
    const obj = orderDoc.toObject() as any;
    if (Array.isArray(obj.order_items)) {
      obj.order_items = obj.order_items.map((item: any) => {
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
    const order = new Order(data);
    console.log("Saving order:", order);
    await order.save();

    // populate the product document (not just its id) for each order item
    await order.populate({
      path: "order_items",
      populate: { path: "product_id", model: Product.modelName },
    });

    return this.mapOrder(order);
  }

  async findById(id: string): Promise<OrderResponseDTO | null> {
    const order = await Order.findById(id)
      .populate({
        path: "order_items",
        populate: { path: "product_id", model: Product.modelName },
      })
      .exec();
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
    return order ? this.mapOrder(order) : null;
  }

  async findAll(): Promise<OrderResponseDTO[]> {
    const orders = await Order.find()
      .populate({
        path: "order_items",
        populate: { path: "product_id", model: Product.modelName },
      })
      .exec();
    return orders.map((order) => this.mapOrder(order));
  }

  async getOrdersByUserId(userId: string): Promise<OrderResponseDTO[]> {
    const orders = await Order.find({ user_id: userId })
      .populate({
        path: "order_items",
        populate: { path: "product_id", model: Product.modelName },
      })
      .exec();
    return orders.map((order) => this.mapOrder(order));
  }
  async getAllOrders(): Promise<OrderResponseDTO[]> {
    const orders = await Order.find()
      .populate({
        path: "order_items",
        populate: { path: "product_id", model: Product.modelName },
      })
      .exec();
    return orders.map((order) => this.mapOrder(order));
  }

  async filterOrdersByStatus(status: string): Promise<OrderResponseDTO[]> {
    const orders = await Order.find({ status })
      .populate({
        path: "order_items",
        populate: { path: "product_id", model: Product.modelName },
      })
      .exec();
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
    return this.mapOrderItem(orderItem);
  }

  async findById(id: string): Promise<OrderItemResponseDTO | null> {
    const orderItem = await OrderItem.findById(id)
      .populate("product_id")
      .exec();
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
    return orderItem ? this.mapOrderItem(orderItem) : null;
  }

  async findAllByUserId(
    userId: Types.ObjectId
  ): Promise<OrderItemResponseDTO[]> {
    const orderItems = await OrderItem.find({ user_id: userId })
      .populate("product_id")
      .exec();
    return orderItems.map((item) => this.mapOrderItem(item));
  }

  async delete(id: string): Promise<boolean> {
    const orderItem = await OrderItem.findByIdAndDelete(id).exec();
    return !!orderItem;
  }
}
