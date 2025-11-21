import { Types } from "mongoose";
import Order from "../../../database/models/order.model";
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
  async create(data: CreateOrderDTO): Promise<OrderResponseDTO> {
    const order = new Order(data);
    console.log("Saving order:", order);
    await order.save();
    await order.populate({
      path: "order_items",
      populate: { path: "product_id" },
    });
    return order.toObject() as OrderResponseDTO;
  }

  async findById(id: string): Promise<OrderResponseDTO | null> {
    const order = await Order.findById(id)
      .populate({
        path: "order_items",
        populate: { path: "product_id" },
      })
      .exec();
    return order ? (order.toObject() as OrderResponseDTO) : null;
  }

  async update(
    id: string,
    data: Partial<UpdateOrderDTO>
  ): Promise<OrderResponseDTO | null> {
    const order = await Order.findByIdAndUpdate(id, data, { new: true })
      .populate({
        path: "order_items",
        populate: { path: "product_id" },
      })
      .exec();
    return order ? (order.toObject() as OrderResponseDTO) : null;
  }

  async findAll(): Promise<OrderResponseDTO[]> {
    const orders = await Order.find()
      .populate({
        path: "order_items",
        populate: { path: "product_id" },
      })
      .exec();
    return orders.map((order) => order.toObject() as OrderResponseDTO);
  }

  async getOrdersByUserId(userId: string): Promise<OrderResponseDTO[]> {
    const orders = await Order.find({ user_id: userId })
      .populate({
        path: "order_items",
        populate: { path: "product_id" },
      })
      .exec();
    return orders.map((order) => order.toObject() as OrderResponseDTO);
  }
  async getAllOrders(): Promise<OrderResponseDTO[]> {
    const orders = await Order.find()
      .populate({
        path: "order_items",
        populate: { path: "product_id" },
      })
      .exec();
    return orders.map((order) => order.toObject() as OrderResponseDTO);
  }

  async filterOrdersByStatus(status: string): Promise<OrderResponseDTO[]> {
    const orders = await Order.find({ status })
      .populate({
        path: "order_items",
        populate: { path: "product_id" },
      })
      .exec();
    return orders.map((order) => order.toObject() as OrderResponseDTO);
  }
}

export class OrderItemRepository {
  async create(data: CreateOrderItemDTO): Promise<OrderItemResponseDTO> {
    const orderItem = new OrderItem(data);
    await orderItem.save();

    return orderItem.toObject() as OrderItemResponseDTO;
  }

  async findById(id: string): Promise<OrderItemResponseDTO | null> {
    const orderItem = await OrderItem.findById(id).exec();
    return orderItem ? (orderItem.toObject() as OrderItemResponseDTO) : null;
  }

  async update(
    id: string,
    data: UpdateOrderItemDTO
  ): Promise<OrderItemResponseDTO | null> {
    const orderItem = await OrderItem.findByIdAndUpdate(id, data, {
      new: true,
    }).exec();
    return orderItem ? (orderItem.toObject() as OrderItemResponseDTO) : null;
  }

  async findAllByUserId(
    userId: Types.ObjectId
  ): Promise<OrderItemResponseDTO[]> {
    const orderItems = await OrderItem.find({ user_id: userId }).exec();
    return orderItems.map((item) => item.toObject() as OrderItemResponseDTO);
  }

  async delete(id: string): Promise<boolean> {
    const orderItem = await OrderItem.findByIdAndDelete(id).exec();
    return !!orderItem;
  }
}
