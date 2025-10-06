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
    return ProductReview.find(query);
  }

  async findById(id: string): Promise<IProductReview | null> {
    return ProductReview.findById(id);
  }
  async findByProductAndUser(
    productId: string,
    userId: string
  ): Promise<IProductReview | null> {
    return ProductReview.findOne({
      product_id: new Types.ObjectId(productId),
      user_id: new Types.ObjectId(userId),
    });
  }

  async update(
    id: string,
    data: UpdateProductReviewDto
  ): Promise<IProductReview | null> {
    return ProductReview.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<IProductReview | null> {
    return ProductReview.findByIdAndDelete(id);
  }
}
