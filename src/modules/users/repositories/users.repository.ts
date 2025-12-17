import User, { IUser } from "../../../database/models/user.model";
import {
  CreateUserDto,
  UpdateProfileDto,
  UserResponseDto,
} from "../dtos/users.dto";

// Users repository placeholder.
export class UserRepository {
  /**
   * Creates a new user in the database.
   * @param userData The data for the new user.
   * @returns The created user document.
   */
  async create(userData: CreateUserDto): Promise<IUser> {
    const user = new User(userData);
    await user.save();
    return user;
  }

  /**
   * Updates a user's profile.
   * @param id The user ID.
   * @param data The profile data to update.
   * @returns The updated user document without sensitive fields.
   */
  async updateProfile(id: string, data: UpdateProfileDto): Promise<any | null> {
    return User.findByIdAndUpdate(id, data, { new: true })
      .select("-refresh_token")
      .exec();
  }

  /**
   * Finds a user by email.
   * @param email The email to search for.
   * @returns The user document if found, otherwise null.
   */

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).exec();
  }

  /**
   * Finds a user by ID.
   * @param id The ID to search for.
   * @returns The user document if found, otherwise null.
   */
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }

  /**
   * Gets all users from the database.
   * @returns An array of all user documents.
   */
  async findAll(): Promise<IUser[]> {
    return User.find().select("-password_hash -refresh_token").exec();
  }

  /**
   * Gets a user by ID without sensitive fields.
   * @param id The user ID.
   * @returns The user document without password hash and refresh token.
   */
  async findByIdSafe(id: string): Promise<IUser | null> {
    return User.findById(id).select("-password_hash -refresh_token").exec();
  }

  /**
   * Deletes a user by ID.
   * @param id The user ID.
   * @returns True if user was deleted, false otherwise.
   */
  async delete(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id).exec();
    return !!result;
  }

  /**
   * Updates a user's profile image URL.
   * @param id The user ID.
   * @param imageUrl The new profile image URL.
   * @returns The updated user document without sensitive fields.
   */
  async updateProfileImage(
    id: string,
    imageUrl: string
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      id,
      { profile_image_url: imageUrl },
      { new: true }
    )
      .select("-password_hash -refresh_token")
      .exec();
  }

  /**
   * Updates a user by ID.
   * @param id The user ID.
   * @param updateData The data to update.
   * @returns The updated user document without sensitive fields.
   */
  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, updateData, { new: true })
      .select("-password_hash -refresh_token")
      .exec();
  }
}
