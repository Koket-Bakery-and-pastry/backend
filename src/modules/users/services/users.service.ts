import { HttpError } from "../../../core/errors/HttpError";
import { IUser } from "../../../database/models/user.model";
import {
  CreateUserDto,
  UpdateProfileDto,
  UserResponseDto,
} from "../dtos/users.dto";
import { UserRepository } from "../repositories/users.repository";
import * as bcrypt from "bcrypt";
import Order from "../../../database/models/order.model";
import ProductReview from "../../../database/models/productReview.model";

// Users service placeholder.
export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Registers a new user.
   * @param userData The data for the new user, including name, email, and plain text password.
   * @returns The created user document (without the password hash).
   * @throws HttpError if a user with the provided email already exists.
   */
  async registerUser(
    userData: CreateUserDto
  ): Promise<Omit<IUser, "password_hash">> {
    const { name, email, password, phone_number } = userData;

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new HttpError(409, "User with this email already exists.");
    }

    if (!password) {
      throw new HttpError(400, "Password is required for registration.");
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await this.userRepository.create({
      name,
      email,
      password_hash,
      phone_number,
    } as any);
    const { password_hash: _, ...userWithoutHash } = newUser.toObject();
    return userWithoutHash;
  }

  /**
   * Gets all users (admin only).
   * @returns An array of all users without sensitive fields.
   */
  async getAllUsers(): Promise<IUser[]> {
    return this.userRepository.findAll();
  }

  /**
   * Gets a user by ID (admin only).
   * @param id The user ID.
   * @returns The user without sensitive fields.
   * @throws HttpError if user not found.
   */
  async getUserById(id: string): Promise<IUser> {
    const user = await this.userRepository.findByIdSafe(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return user;
  }

  /**
   * Deletes a user by ID (admin only).
   * @param id The user ID.
   * @throws HttpError if user not found.
   */
  async deleteUser(id: string): Promise<void> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new HttpError(404, "User not found");
    }
  }

  /**
   * Updates a user's profile image.
   * @param id The user ID.
   * @param imageUrl The new profile image URL.
   * @returns The updated user.
   * @throws HttpError if user not found.
   */
  async updateProfileImage(id: string, imageUrl: string): Promise<IUser> {
    const user = await this.userRepository.updateProfileImage(id, imageUrl);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return user;
  }

  /**
   * Updates the current user's profile.
   * @param id The user ID.
   * @param data The profile data to update.
   * @returns The updated user.
   * @throws HttpError if user not found or email already exists.
   */
  async updateProfile(
    id: string,
    data: UpdateProfileDto
  ): Promise<UserResponseDto> {
    // Check if email is being updated and already exists
    if (data.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser && existingUser._id.toString() !== id) {
        throw new HttpError(409, "Email already in use by another account");
      }
    }

    const user = await this.userRepository.updateProfile(id, data);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return user;
  }

  /**
   * Gets the current authenticated user's profile with stats.
   * @param id The user ID.
   * @returns The user profile with total orders, spending, and recent ratings.
   * @throws HttpError if user not found.
   */
  async getProfile(id: string): Promise<any> {
    const user = await this.userRepository.findByIdSafe(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    // Get user's orders
    const orders = await Order.find({ user_id: id }).exec();
    const totalOrders = orders.length;

    // Calculate total spending (sum of total_price from all orders)
    const totalSpending = orders.reduce(
      (sum, order) => sum + (order.total_price || 0),
      0
    );

    // Get user's recent ratings (reviews)
    const recentRatings = await ProductReview.find({ user_id: id })
      .populate("product_id", "name image_url")
      .sort({ created_at: -1 })
      .limit(5)
      .exec();

    return {
      ...user.toObject(),
      stats: {
        totalOrders,
        totalSpending,
        recentRatings: recentRatings.map((review) => ({
          product: review.product_id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
        })),
      },
    };
  }
}
