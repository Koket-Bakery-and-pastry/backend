import path from "path";
import fs from "fs";
import { Types } from "mongoose";
import {
  customCakeRepository,
  customOrderRepository,
} from "../repositories/custom-orders.repository";
import {
  CreateCustomCakeDTO,
  UpdateCustomCakeDTO,
  CreateCustomOrderWithFileDTO,
  UpdateCustomOrderDTO,
  CustomCakeResponseDTO,
  CustomOrderResponseDTO,
  CustomOrderWithDetailsDTO,
  CustomOrderQueryDTO,
  PaginatedResponse,
} from "../dtos/custom-orders.dto";
import Product from "../../../database/models/product.model";

export class CustomCakeService {
  async createCustomCake(
    data: CreateCustomCakeDTO
  ): Promise<CustomCakeResponseDTO> {
    try {
      // Validate that the base product exists
      const product = await Product.findById(data.product_id);
      if (!product) {
        throw new Error("Base product not found");
      }

      // Handle file upload if reference image is provided
      if (data.reference_image_file) {
        const uploadDir = path.join(__dirname, "../../uploads/custom-cakes");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const newFileName = `${Date.now()}-${
          data.reference_image_file.originalname
        }`;
        const filePath = path.join(uploadDir, newFileName);

        await fs.promises.writeFile(filePath, data.reference_image_file.buffer);
        data.reference_image_url = `/uploads/custom-cakes/${newFileName}`;
      }

      const customCake = await customCakeRepository.create(data);
      return customCake;
    } catch (error) {
      // Clean up uploaded file if creation fails
      if (
        data.reference_image_file?.path &&
        fs.existsSync(data.reference_image_file.path)
      ) {
        fs.unlinkSync(data.reference_image_file.path);
      }
      throw error;
    }
  }

  async calculateCustomCakePrice(
    productId: string,
    modifications: {
      kilo?: number;
      pieces?: number;
      quantity: number;
      description: string;
    }
  ): Promise<number> {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    let basePrice = 0;

    // Calculate base price based on kilo or pieces
    if (modifications.kilo) {
      const availableKilos = Object.keys(product.kilo_to_price_map)
        .map((k) => parseFloat(k))
        .sort((a, b) => a - b);

      const selectedKilo =
        availableKilos.find((k) => k >= modifications.kilo!) ||
        availableKilos[availableKilos.length - 1];
      basePrice = product.kilo_to_price_map[selectedKilo.toString()];
    } else if (modifications.pieces && product.is_pieceable) {
      basePrice = (product.kilo_to_price_map["1"] || 0) * modifications.pieces;
    } else {
      basePrice = product.kilo_to_price_map["1"] || 0;
    }

    // Apply custom pricing logic based on description complexity
    let customMultiplier = 1.0;
    const description = modifications.description.toLowerCase();

    // Simple pricing adjustments based on customization complexity
    if (description.includes("complex") || description.includes("detailed")) {
      customMultiplier = 1.3; // 30% increase for complex designs
    } else if (
      description.includes("simple") ||
      description.includes("basic")
    ) {
      customMultiplier = 1.1; // 10% increase for basic customization
    } else {
      customMultiplier = 1.2; // 20% default increase for custom work
    }

    const finalPrice = basePrice * modifications.quantity * customMultiplier;
    return Math.round(finalPrice);
  }

  async getCustomCakeById(id: string): Promise<CustomCakeResponseDTO | null> {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("Invalid custom cake ID");
    }
    return await customCakeRepository.findById(id);
  }

  async getCustomCakesByUserId(
    userId: string
  ): Promise<CustomCakeResponseDTO[]> {
    if (!userId || typeof userId !== "string" || !userId.trim()) {
      throw new Error("Invalid user ID");
    }
    return await customCakeRepository.findByUserId(userId);
  }

  async updateCustomCake(
    id: string,
    data: UpdateCustomCakeDTO
  ): Promise<CustomCakeResponseDTO | null> {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("Invalid custom cake ID");
    }
    return await customCakeRepository.update(id, data);
  }

  async deleteCustomCake(id: string): Promise<boolean> {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("Invalid custom cake ID");
    }
    return await customCakeRepository.delete(id);
  }

  async getAllCustomCakes(
    query: CustomOrderQueryDTO = {}
  ): Promise<PaginatedResponse<CustomCakeResponseDTO>> {
    const result = await customCakeRepository.findAll(query);
    return {
      data: result.customCakes,
      pagination: result.pagination,
    };
  }
}

export class CustomOrderService {
  async createCustomOrder(
    data: CreateCustomOrderWithFileDTO
  ): Promise<CustomOrderResponseDTO> {
    try {
      // Handle payment proof file upload
      const uploadDir = path.join(__dirname, "../../uploads/custom-orders");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const newFileName = `${Date.now()}-${
        data.payment_proof_file.originalname
      }`;
      const filePath = path.join(uploadDir, newFileName);

      await fs.promises.writeFile(filePath, data.payment_proof_file.buffer);
      const paymentProofUrl = `/uploads/custom-orders/${newFileName}`;

      // Prepare order data
      const orderData = {
        ...data,
        payment_proof_url: paymentProofUrl,
      };

      const customOrder = await customOrderRepository.create(orderData);
      return customOrder;
    } catch (error) {
      // Clean up uploaded file if order creation fails
      if (
        data.payment_proof_file?.path &&
        fs.existsSync(data.payment_proof_file.path)
      ) {
        fs.unlinkSync(data.payment_proof_file.path);
      }
      throw error;
    }
  }

  async getCustomOrderById(
    id: string
  ): Promise<CustomOrderWithDetailsDTO | null> {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("Invalid custom order ID");
    }

    const customOrder = await customOrderRepository.findById(id);
    if (!customOrder) {
      return null;
    }

    return this.formatCustomOrderWithDetails(customOrder);
  }

  async getCustomOrdersByUserId(
    userId: string,
    query: CustomOrderQueryDTO = {}
  ): Promise<PaginatedResponse<CustomOrderWithDetailsDTO>> {
    if (!userId || typeof userId !== "string" || !userId.trim()) {
      throw new Error("Invalid user ID");
    }

    const result = await customOrderRepository.findByUserId(userId, query);
    return {
      data: result.customOrders.map((order) =>
        this.formatCustomOrderWithDetails(order)
      ),
      pagination: result.pagination,
    };
  }

  async getAllCustomOrders(
    query: CustomOrderQueryDTO = {}
  ): Promise<PaginatedResponse<CustomOrderWithDetailsDTO>> {
    const result = await customOrderRepository.findAll(query);
    return {
      data: result.customOrders.map((order) =>
        this.formatCustomOrderWithDetails(order)
      ),
      pagination: result.pagination,
    };
  }

  async updateCustomOrder(
    id: string,
    data: UpdateCustomOrderDTO
  ): Promise<CustomOrderResponseDTO | null> {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("Invalid custom order ID");
    }
    return await customOrderRepository.update(id, data);
  }

  async deleteCustomOrder(id: string): Promise<boolean> {
    if (!id || typeof id !== "string" || !id.trim()) {
      throw new Error("Invalid custom order ID");
    }
    return await customOrderRepository.delete(id);
  }

  async filterCustomOrdersByStatus(
    status: string
  ): Promise<CustomOrderWithDetailsDTO[]> {
    if (!status || typeof status !== "string" || !status.trim()) {
      throw new Error("Invalid status");
    }

    if (!["pending", "accepted", "rejected", "completed"].includes(status)) {
      throw new Error("Invalid status value");
    }

    const result = await customOrderRepository.findAll({
      status: status as any,
      page: 1,
      limit: 1000,
    });

    return result.customOrders.map((order) =>
      this.formatCustomOrderWithDetails(order)
    );
  }

  async getCustomOrderStats(timeFrame: "daily" | "weekly" | "monthly") {
    return await customOrderRepository.getOrderStats(timeFrame);
  }

  private formatCustomOrderWithDetails(order: any): CustomOrderWithDetailsDTO {
    return {
      ...order,
      custom_cake_details: {
        ...order.custom_cake_id,
        product_details: order.custom_cake_id?.product_id,
      },
      user_details: order.user_id,
    };
  }
}

export const customCakeService = new CustomCakeService();
export const customOrderService = new CustomOrderService();
