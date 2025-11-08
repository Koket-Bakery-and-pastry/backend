import { Types } from "mongoose";
import ProductReview, {
  IProductReview,
} from "../../../database/models/productReview.model";
import {
  CreateProductReviewDto,
  UpdateProductReviewDto,
} from "../dtos/reviews.dto";
import { string } from "zod";

export class ProductReviewRepository {
  async create(data: CreateProductReviewDto): Promise<IProductReview> {
    const review = new ProductReview(data);
    await review.save();
    await review.populate({
      path: "product_id",
      populate: [{ path: "category_id" }, { path: "subcategory_id" }],
    });
    return review;
  }

  async findAll(filters?: {
    productId?: string;
    userId?: string;
  }): Promise<IProductReview[]> {
    const query: { product_id?: Types.ObjectId; user_id?: Types.ObjectId } = {};
    if (filters?.productId) {
      query.product_id = new Types.ObjectId(filters.productId);
    }
    if (filters?.userId) {
      query.user_id = new Types.ObjectId(filters.userId);
    }
    return ProductReview.find(query).populate({
      path: "product_id",
      populate: [{ path: "category_id" }, { path: "subcategory_id" }],
    });
  }

  async findById(id: string): Promise<IProductReview | null> {
    return ProductReview.findById(id).populate({
      path: "product_id",
      populate: [{ path: "category_id" }, { path: "subcategory_id" }],
    });
  }
  async findByProductAndUser(
    productId: string,
    userId: string
  ): Promise<IProductReview | null> {
    return ProductReview.findOne({
      product_id: new Types.ObjectId(productId),
      user_id: new Types.ObjectId(userId),
    }).populate({
      path: "product_id",
      populate: [{ path: "category_id" }, { path: "subcategory_id" }],
    });
  }

  async update(
    id: string,
    data: UpdateProductReviewDto
  ): Promise<IProductReview | null> {
    return ProductReview.findByIdAndUpdate(id, data, { new: true }).populate({
      path: "product_id",
      populate: [{ path: "category_id" }, { path: "subcategory_id" }],
    });
  }

  async delete(id: string): Promise<IProductReview | null> {
    const review = await ProductReview.findByIdAndDelete(id);
    if (review) {
      await review.populate({
        path: "product_id",
        populate: [{ path: "category_id" }, { path: "subcategory_id" }],
      });
    }
    return review;
  }
}
