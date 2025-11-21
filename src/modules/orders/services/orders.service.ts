import {
  OrderItemRepository,
  OrdersRepository,
} from "./../repositories/orders.repository";
import path from "path";
import fs from "fs";
import {
  CreateOrderItemDTO,
  CreateOrderWithFileDTO,
  OrderItemResponseDTO,
  OrderResponseDTO,
  UpdateOrderDTO,
  UpdateOrderItemDTO,
} from "../dtos/orders.dto";
import { Types } from "mongoose";
import { ObjectId } from "mongodb";

// Orders service placeholder.
export class OrdersService {
  private ordersRepository: OrdersRepository;
  constructor() {
    this.ordersRepository = new OrdersRepository();
  }

  async createOrder(data: CreateOrderWithFileDTO): Promise<OrderResponseDTO> {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const newFileName = `${Date.now()}-${data.payment_proof_file.originalname}`;
    const filePath = path.join(uploadDir, newFileName);

    await fs.promises.rename(data.payment_proof_file.path, filePath);
    data.payment_proof_url = `/uploads/${newFileName}`;

    const order = await this.ordersRepository.create(data);
    console.log("Created order:", order);
    return order;
  }

  async getOrderById(id: string): Promise<OrderResponseDTO | null> {
    const order = await this.ordersRepository.findById(id);
    return order;
  }

  async updateOrder(
    id: string,
    data: Partial<UpdateOrderDTO>
  ): Promise<OrderResponseDTO | null> {
    const updatedOrder = await this.ordersRepository.update(id, data);
    return updatedOrder;
  }
  async getAllOrders(): Promise<OrderResponseDTO[]> {
    return await this.ordersRepository.getAllOrders();
  }
  async filterOrdersByStatus(status: string): Promise<OrderResponseDTO[]> {
    return await this.ordersRepository.filterOrdersByStatus(status);
  }
  async getOrdersByUserId(userId: string): Promise<OrderResponseDTO[]> {
    return await this.ordersRepository.getOrdersByUserId(userId);
  }
}

export class OrderItemService {
  private orderItemRepository: OrderItemRepository;
  constructor() {
    this.orderItemRepository = new OrderItemRepository();
  }

  async getOrderItemsByUserId(
    userId: Types.ObjectId
  ): Promise<OrderItemResponseDTO[]> {
    return await this.orderItemRepository.findAllByUserId(userId);
  }

  async getOrderItemById(id: string): Promise<OrderItemResponseDTO | null> {
    if (typeof id !== "string" || !id.trim()) {
      throw new Error("Invalid order item id");
    }
    return await this.orderItemRepository.findById(id);
  }

  async updateOrderItem(
    id: string,
    userId: Types.ObjectId,
    data: UpdateOrderItemDTO
  ): Promise<OrderItemResponseDTO | null> {
    if (typeof id !== "string" || !id.trim()) {
      throw new Error("Invalid order item id");
    }
    const item = await this.getOrderItemById(id);
    if (!item.user_id.equals(new ObjectId(userId))) {
      return null;
    }
    return await this.orderItemRepository.update(id, data);
  }

  async createOrderItem(
    data: CreateOrderItemDTO
  ): Promise<OrderItemResponseDTO> {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid order item data");
    }
    return await this.orderItemRepository.create(data);
  }

  async deleteOrderItem(id: string, userId: Types.ObjectId): Promise<boolean> {
    if (typeof id !== "string" || !id.trim()) {
      throw new Error("Invalid order item id");
    }

    const item = await this.getOrderItemById(id);
    if (!item.user_id.equals(new ObjectId(userId))) {
      return null;
    }
    return await this.orderItemRepository.delete(id);
  }
}
