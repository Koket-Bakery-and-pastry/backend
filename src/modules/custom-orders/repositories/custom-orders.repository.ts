import { Types, FilterQuery } from "mongoose";
import CustomCake from "../../../database/models/customCake.model";
import CustomOrder from "../../../database/models/customOrder.model";
import {
  CreateCustomCakeDTO,
  UpdateCustomCakeDTO,
  CreateCustomOrderDTO,
  UpdateCustomOrderDTO,
  CustomCakeResponseDTO,
  CustomOrderResponseDTO,
  CustomOrderQueryDTO,
} from "../dtos/custom-orders.dto";

export class CustomCakeRepository {
  async create(data: CreateCustomCakeDTO): Promise<CustomCakeResponseDTO> {
    const customCake = new CustomCake(data);
    await customCake.save();
    return customCake.toObject() as CustomCakeResponseDTO;
  }

  async findById(id: string): Promise<CustomCakeResponseDTO | null> {
    const customCake = await CustomCake.findById(id)
      .populate("user_id", "name email")
      .populate("product_id")
      .exec();
    return customCake ? (customCake.toObject() as CustomCakeResponseDTO) : null;
  }

  async findByUserId(userId: string): Promise<CustomCakeResponseDTO[]> {
    const customCakes = await CustomCake.find({
      user_id: new Types.ObjectId(userId),
    })
      .populate("user_id", "name email")
      .populate("product_id")
      .sort({ created_at: -1 })
      .exec();
    return customCakes.map((cake) => cake.toObject() as CustomCakeResponseDTO);
  }

  async update(
    id: string,
    data: UpdateCustomCakeDTO
  ): Promise<CustomCakeResponseDTO | null> {
    const customCake = await CustomCake.findByIdAndUpdate(id, data, {
      new: true,
    })
      .populate("user_id", "name email")
      .populate("product_id")
      .exec();
    return customCake ? (customCake.toObject() as CustomCakeResponseDTO) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await CustomCake.findByIdAndDelete(id).exec();
    return !!result;
  }

  async findAll(query: CustomOrderQueryDTO = {}): Promise<{
    customCakes: CustomCakeResponseDTO[];
    total: number;
    pagination: any;
  }> {
    const { page = 1, limit = 10, user_id } = query;

    const filter: FilterQuery<any> = {};
    if (user_id) filter.user_id = new Types.ObjectId(user_id);

    const skip = (page - 1) * limit;
    const total = await CustomCake.countDocuments(filter);

    const customCakes = await CustomCake.find(filter)
      .populate("user_id", "name email")
      .populate("product_id")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      customCakes: customCakes.map(
        (cake) => cake.toObject() as CustomCakeResponseDTO
      ),
      total,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export class CustomOrderRepository {
  async create(data: CreateCustomOrderDTO): Promise<CustomOrderResponseDTO> {
    const customOrder = new CustomOrder(data);
    await customOrder.save();

    // Populate the saved order
    const populatedOrder = await CustomOrder.findById(customOrder._id)
      .populate({
        path: "custom_cake_id",
        populate: {
          path: "product_id",
          model: "Product",
        },
      })
      .populate("user_id", "name email")
      .exec();

    return populatedOrder!.toObject() as CustomOrderResponseDTO;
  }

  async findById(id: string): Promise<CustomOrderResponseDTO | null> {
    const customOrder = await CustomOrder.findById(id)
      .populate({
        path: "custom_cake_id",
        populate: {
          path: "product_id",
          model: "Product",
        },
      })
      .populate("user_id", "name email")
      .exec();
    return customOrder
      ? (customOrder.toObject() as CustomOrderResponseDTO)
      : null;
  }

  async findByUserId(
    userId: string,
    query: CustomOrderQueryDTO = {}
  ): Promise<{
    customOrders: CustomOrderResponseDTO[];
    total: number;
    pagination: any;
  }> {
    const { page = 1, limit = 10, status, start_date, end_date } = query;

    const filter: FilterQuery<any> = { user_id: new Types.ObjectId(userId) };

    if (status) filter.status = status;
    if (start_date || end_date) {
      filter.created_at = {};
      if (start_date) filter.created_at.$gte = new Date(start_date);
      if (end_date) filter.created_at.$lte = new Date(end_date);
    }

    const skip = (page - 1) * limit;
    const total = await CustomOrder.countDocuments(filter);

    const customOrders = await CustomOrder.find(filter)
      .populate({
        path: "custom_cake_id",
        populate: {
          path: "product_id",
          model: "Product",
        },
      })
      .populate("user_id", "name email")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      customOrders: customOrders.map(
        (order) => order.toObject() as CustomOrderResponseDTO
      ),
      total,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findAll(query: CustomOrderQueryDTO = {}): Promise<{
    customOrders: CustomOrderResponseDTO[];
    total: number;
    pagination: any;
  }> {
    const {
      page = 1,
      limit = 10,
      status,
      start_date,
      end_date,
      user_id,
    } = query;

    const filter: FilterQuery<any> = {};

    if (status) filter.status = status;
    if (user_id) filter.user_id = new Types.ObjectId(user_id);
    if (start_date || end_date) {
      filter.created_at = {};
      if (start_date) filter.created_at.$gte = new Date(start_date);
      if (end_date) filter.created_at.$lte = new Date(end_date);
    }

    const skip = (page - 1) * limit;
    const total = await CustomOrder.countDocuments(filter);

    const customOrders = await CustomOrder.find(filter)
      .populate({
        path: "custom_cake_id",
        populate: {
          path: "product_id",
          model: "Product",
        },
      })
      .populate("user_id", "name email")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      customOrders: customOrders.map(
        (order) => order.toObject() as CustomOrderResponseDTO
      ),
      total,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async update(
    id: string,
    data: UpdateCustomOrderDTO
  ): Promise<CustomOrderResponseDTO | null> {
    const customOrder = await CustomOrder.findByIdAndUpdate(
      id,
      { ...data, updated_at: new Date() },
      { new: true }
    )
      .populate({
        path: "custom_cake_id",
        populate: {
          path: "product_id",
          model: "Product",
        },
      })
      .populate("user_id", "name email")
      .exec();
    return customOrder
      ? (customOrder.toObject() as CustomOrderResponseDTO)
      : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await CustomOrder.findByIdAndDelete(id).exec();
    return !!result;
  }

  async getOrderStats(timeFrame: "daily" | "weekly" | "monthly"): Promise<any> {
    const now = new Date();
    let startDate = new Date();

    switch (timeFrame) {
      case "daily":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "weekly":
        startDate.setDate(now.getDate() - 7);
        break;
      case "monthly":
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    return await CustomOrder.aggregate([
      {
        $match: {
          created_at: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$total_price" },
          totalUpfront: { $sum: "$upfront_paid" },
        },
      },
    ]);
  }
}

export const customCakeRepository = new CustomCakeRepository();
export const customOrderRepository = new CustomOrderRepository();
