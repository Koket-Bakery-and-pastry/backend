import { HttpError } from "../../../core/errors/HttpError";
import { IProductReview } from "../../../database/models/productReview.model";
import { CreateProductReviewDto } from "../dtos/reviews.dto";
import { ProductRepository } from "../../products/repositories/products.repository";
import { UserRepository } from "../../users/repositories/users.repository";
import { UpdateProductReviewDto } from "../dtos/reviews.dto";
import { ProductReviewRepository } from "../repositories/reviews.repository";

export class ProductReviewService {
  private productReviewRepository: ProductReviewRepository;
  private productRepository: ProductRepository;
  private userRepository: UserRepository;

  constructor() {
    this.productReviewRepository = new ProductReviewRepository();
    this.productRepository = new ProductRepository();
    this.userRepository = new UserRepository();
  }

  async createOrUpdateProductReview(
    data: CreateProductReviewDto
  ): Promise<IProductReview> {
    const product = await this.productRepository.findById(data.product_id);
    if (!product) {
      throw new HttpError(
        404,
        `Product with ID '${data.product_id}' not found.`
      );
    }

    const user = await this.userRepository.findById(data.user_id);
    if (!user) {
      throw new HttpError(404, `User with ID '${data.user_id}' not found.`);
    }

    const exisitingReview =
      await this.productReviewRepository.findByProductAndUser(
        data.product_id,
        data.user_id
      );
    if (exisitingReview) {
      // Update existing review
      const updatedReview = await this.productReviewRepository.update(
        exisitingReview._id.toString(),
        {
          rating: data.rating,
          comment: data.comment,
        }
      );
      return updatedReview;
    } else {
      return this.productReviewRepository.create(data);
    }
  }
  async getAllProductReviews(filters?: {
    productId?: string;
    userId?: string;
  }): Promise<IProductReview[]> {
    if (filters?.productId) {
      const product = await this.productRepository.findById(filters.productId);
      if (!product) {
        throw new HttpError(
          404,
          `Product with ID '${filters.productId}' not found.`
        );
      }
    }

    if (filters?.userId) {
      const user = await this.userRepository.findById(filters.userId);
      if (!user) {
        throw new HttpError(404, `User with ID '${filters.userId}' not found.`);
      }
    }

    return this.productReviewRepository.findAll(filters);
  }

  async getProductReviewById(id: string): Promise<IProductReview> {
    const review = await this.productReviewRepository.findById(id);
    if (!review) {
      throw new HttpError(404, `Review with ID '${id}' not found.`);
    }
    return review;
  }

  async updateProductReview(
    id: string,
    updateData: UpdateProductReviewDto
  ): Promise<IProductReview> {
    const updatedReview = await this.productReviewRepository.update(
      id,
      updateData
    );
    if (!updatedReview) {
      throw new HttpError(404, `Review with ID '${id}' not found.`);
    }
    return updatedReview;
  }

  async deleteProductReview(id: string): Promise<IProductReview> {
    const deletedReview = await this.productReviewRepository.delete(id);
    if (!deletedReview) {
      throw new HttpError(
        404,
        `Product review with ID '${id}' not found for deletion.`
      );
    }
    return deletedReview;
  }
}
