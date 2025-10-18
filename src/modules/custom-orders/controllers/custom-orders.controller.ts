import { Request, Response } from "express";
import {
  CustomCakeService,
  CustomOrderService,
} from "../services/custom-orders.service";
import {
  CreateCustomCakeDTO,
  UpdateCustomCakeDTO,
  CreateCustomOrderWithFileDTO,
  UpdateCustomOrderDTO,
} from "../dtos/custom-orders.dto";
import type { Multer } from "multer";
import { getPayloadFromAuthHeader } from "../../../shared/utils/jwt";

interface RequestWithFile extends Request {
  file?: Multer.File;
}

export class CustomCakeController {
  private customCakeService: CustomCakeService;

  constructor() {
    this.customCakeService = new CustomCakeService();
  }

  async createCustomCake(req: RequestWithFile, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const data: CreateCustomCakeDTO = {
        ...req.body,
        user_id: payload.userId,
        reference_image_file: req.file,
      };

      const customCake = await this.customCakeService.createCustomCake(data);
      res.status(201).json(customCake);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async getCustomCakeById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const customCake = await this.customCakeService.getCustomCakeById(id);
      if (!customCake) {
        res.status(404).json({ message: "Custom cake not found" });
        return;
      }

      // Users can only view their own custom cakes unless they're admin
      if (
        payload.role !== "admin" &&
        customCake.user_id.toString() !== payload.userId.toString()
      ) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      res.status(200).json(customCake);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async getMyCustomCakes(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const customCakes = await this.customCakeService.getCustomCakesByUserId(
        payload.userId.toString()
      );
      res.status(200).json(customCakes);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async updateCustomCake(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const data: UpdateCustomCakeDTO = req.body;
      const customCake = await this.customCakeService.updateCustomCake(
        id,
        data
      );

      if (!customCake) {
        res.status(404).json({ message: "Custom cake not found" });
        return;
      }

      res.status(200).json(customCake);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async deleteCustomCake(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const deleted = await this.customCakeService.deleteCustomCake(id);
      if (!deleted) {
        res.status(404).json({ message: "Custom cake not found" });
        return;
      }

      res.status(200).json({ message: "Custom cake deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async getAllCustomCakes(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload || payload.role !== "admin") {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      const result = await this.customCakeService.getAllCustomCakes(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
}

export class CustomOrderController {
  private customOrderService: CustomOrderService;

  constructor() {
    this.customOrderService = new CustomOrderService();
  }

  async createCustomOrder(req: RequestWithFile, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const data: CreateCustomOrderWithFileDTO = {
        ...req.body,
        user_id: payload.userId,
        payment_proof_file: req.file!,
      };

      const customOrder = await this.customOrderService.createCustomOrder(data);
      res.status(201).json(customOrder);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async getCustomOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const customOrder = await this.customOrderService.getCustomOrderById(id);
      if (!customOrder) {
        res.status(404).json({ message: "Custom order not found" });
        return;
      }

      // Users can only view their own orders unless they're admin
      if (
        payload.role !== "admin" &&
        customOrder.user_id.toString() !== payload.userId.toString()
      ) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      res.status(200).json(customOrder);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async getMyCustomOrders(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const result = await this.customOrderService.getCustomOrdersByUserId(
        payload.userId.toString(),
        req.query
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async updateCustomOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload || payload.role !== "admin") {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      const data: Partial<UpdateCustomOrderDTO> = req.body;
      const updatedOrder = await this.customOrderService.updateCustomOrder(
        id,
        data
      );

      if (!updatedOrder) {
        res.status(404).json({ message: "Custom order not found" });
        return;
      }

      res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async deleteCustomOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload || payload.role !== "admin") {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      const deleted = await this.customOrderService.deleteCustomOrder(id);
      if (!deleted) {
        res.status(404).json({ message: "Custom order not found" });
        return;
      }

      res.status(200).json({ message: "Custom order deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async getAllCustomOrders(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload || payload.role !== "admin") {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      const result = await this.customOrderService.getAllCustomOrders(
        req.query
      );
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async filterCustomOrdersByStatus(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload || payload.role !== "admin") {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      const { status } = req.query;
      if (!status || typeof status !== "string" || !status.trim()) {
        res.status(400).json({ message: "Invalid status" });
        return;
      }

      const orders = await this.customOrderService.filterCustomOrdersByStatus(
        status
      );
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }

  async getCustomOrderStats(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization || "";
      const payload = getPayloadFromAuthHeader(authHeader);
      if (!payload || payload.role !== "admin") {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      const { timeframe } = req.params;
      if (!["daily", "weekly", "monthly"].includes(timeframe)) {
        res.status(400).json({ message: "Invalid timeframe" });
        return;
      }

      const stats = await this.customOrderService.getCustomOrderStats(
        timeframe as any
      );
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  }
}
