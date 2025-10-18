// Orders controller placeholder.

import { Request, Response } from "express";
import { OrderItemService, OrdersService } from "../services/orders.service";
import {
  CreateOrderItemDTO,
  UpdateOrderItemDTO,
  CreateOrderWithFileDTO,
  UpdateOrderDTO,
  OrderItemDTO,
} from "../dtos/orders.dto";
import type { Multer } from "multer";
import { getPayloadFromAuthHeader } from "../../../shared/utils/jwt";
// Extend Express Request type to include 'file' property
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

export class OrdersController {
  private ordersService: OrdersService;
  constructor() {
    this.ordersService = new OrdersService();
  }

  async createOrder(req: RequestWithFile, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const orderItems: any = JSON.parse(req.body.order_items);

      const data: CreateOrderWithFileDTO = {
        ...req.body,
        order_items: orderItems, // replace string with parsed array
        payment_proof_file: req.file, // file from multer
      };

      data.user_id = payload.userId;
      const order = await this.ordersService.createOrder(data);

      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const order = await this.ordersService.getOrderById(id);
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
  async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      if (payload.role !== "admin") {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      const data: Partial<UpdateOrderDTO> = req.body;
      const updatedOrder = await this.ordersService.updateOrder(id, data);
      if (!updatedOrder) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
      res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      if (payload.role !== "admin") {
        res.status(403).json({ message: "Forbidden" });
        return;
      }
      const orders = await this.ordersService.getAllOrders();
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
  async filterOrdersByStatus(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      if (payload.role !== "admin") {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      const { status } = req.query;
      if (!status || typeof status !== "string" || !status.trim()) {
        res.status(400).json({ message: "Invalid status" });
        return;
      }
      const orders = await this.ordersService.filterOrdersByStatus(status);
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
  async getOrdersByUserId(req: Request, res: Response): Promise<void> {
    try {
      console.log("ezis dershalew ");
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      var userId = payload.userId;

      console.log(userId, userId.toString());

      const orders = await this.ordersService.getOrdersByUserId(
        userId.toString()
      );
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
}

export class OrderItemController {
  private orderItemService: OrderItemService;

  constructor() {
    this.orderItemService = new OrderItemService();
  }

  async getOrderItemsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const userId = payload.userId;
      const items = await this.orderItemService.getOrderItemsByUserId(userId);
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async createOrderItem(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const data: CreateOrderItemDTO = req.body;
      if (!data || typeof data !== "object") {
        res.status(400).json({ message: "Invalid order item data" });
        return;
      }

      data.user_id = payload.userId;
      const item = await this.orderItemService.createOrderItem(data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async getOrderItemById(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const id = req.params.id;
      if (!id || typeof id !== "string" || !id.trim()) {
        res.status(400).json({ message: "Invalid order item id" });
        return;
      }
      const item = await this.orderItemService.getOrderItemById(id);
      if (!item) {
        res.status(404).json({ message: "Order item not found" });
        return;
      }
      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async updateOrderItem(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const id = req.params.id;
      const data: UpdateOrderItemDTO = req.body;
      const userId = payload.userId;
      if (!id || typeof id !== "string" || !id.trim()) {
        res.status(400).json({ message: "Invalid order item id" });
        return;
      }
      const updatedItem = await this.orderItemService.updateOrderItem(
        id,
        userId,
        data
      );
      if (!updatedItem) {
        res.status(404).json({ message: "Order item not found" });
        return;
      }
      res.status(200).json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async deleteOrderItem(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const id = req.params.id;
      const userId = payload.userId;
      if (!id || typeof id !== "string" || !id.trim()) {
        res.status(400).json({ message: "Invalid order item id" });
        return;
      }
      const deleted = await this.orderItemService.deleteOrderItem(id, userId);
      if (!deleted) {
        res.status(404).json({ message: "Order item not found" });
        return;
      }
      res.status(200).json(deleted);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
}
