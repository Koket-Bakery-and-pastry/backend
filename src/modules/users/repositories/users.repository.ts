import User, { IUser } from "../../../database/models/user.model";
import {
  CreateUserDto,
  UpdateProfileDto,
  UserResponseDto,
} from "../dtos/users.dto";

// Users repository placeholder.
export class UserRepository {
  private toResponseDto(doc: any): UserResponseDto | null {
    if (!doc) return null;
    const obj = typeof doc.toObject === "function" ? doc.toObject() : doc;
    const { password_hash, refresh_token, __v, ...rest } = obj;
    const id = rest._id ? String(rest._id) : undefined;
    delete rest._id;
    return { id, ...rest } as UserResponseDto;
  }

  /**
   * Creates a new user in the database.
   * @param userData The data for the new user.
   * @returns The created user document as UserResponseDto.
   */
  async create(userData: CreateUserDto): Promise<UserResponseDto> {
    const user = new User(userData);
    const saved = await user.save();
    const dto = this.toResponseDto(saved);
    // dto should never be null here because saved exists
    return dto as UserResponseDto;
  }

  /**
   * Updates a user's profile.
   * @param id The user ID.
   * @param data The profile data to update.
   * @returns The updated user as UserResponseDto or null.
   */
  async updateProfile(
    id: string,
    data: UpdateProfileDto
  ): Promise<UserResponseDto | null> {
    const updated = await User.findByIdAndUpdate(id, data, { new: true })
      .select("-refresh_token -password_hash")
      .exec();
    return this.toResponseDto(updated);
  }

  /**
   * Finds a user by email.
   * @param email The email to search for.
   * @returns The user as UserResponseDto if found, otherwise null.
   */
  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const found = await User.findOne({ email })
      .select("-password_hash -refresh_token")
      .exec();
    return this.toResponseDto(found);
  }

  /**
   * Finds a user by ID.
   * @param id The ID to search for.
   * @returns The user as UserResponseDto if found, otherwise null.
   */
  async findById(id: string): Promise<UserResponseDto | null> {
    const found = await User.findById(id)
      .select("-password_hash -refresh_token")
      .exec();
    return this.toResponseDto(found);
  }

  /**
   * Gets all users from the database.
   * @returns An array of UserResponseDto.
   */
  async findAll(): Promise<UserResponseDto[]> {
    const users = await User.find()
      .select("-password_hash -refresh_token")
      .exec();
    return (users || []).map((u) => this.toResponseDto(u) as UserResponseDto);
  }

  /**
   * Gets a user by ID without sensitive fields.
   * @param id The user ID.
   * @returns The user as UserResponseDto without password hash and refresh token.
   */
  async findByIdSafe(id: string): Promise<UserResponseDto | null> {
    const found = await User.findById(id)
      .select("-password_hash -refresh_token")
      .exec();
    return this.toResponseDto(found);
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
   * @returns The updated user as UserResponseDto or null.
   */
  async updateProfileImage(
    id: string,
    imageUrl: string
  ): Promise<UserResponseDto | null> {
    const updated = await User.findByIdAndUpdate(
      id,
      { profile_image_url: imageUrl },
      { new: true }
    )
      .select("-password_hash -refresh_token")
      .exec();
    return this.toResponseDto(updated);
  }

  /**
   * Updates a user by ID.
   * @param id The user ID.
   * @param updateData The data to update.
   * @returns The updated user as UserResponseDto or null.
   */
  async update(
    id: string,
    updateData: Partial<IUser>
  ): Promise<UserResponseDto | null> {
    const updated = await User.findByIdAndUpdate(id, updateData, { new: true })
      .select("-password_hash -refresh_token")
      .exec();
    return this.toResponseDto(updated);
  }
}
