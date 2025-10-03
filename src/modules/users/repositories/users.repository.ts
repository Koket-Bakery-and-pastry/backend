import User, { IUser } from "../../../database/models/user.model";
import { CreateUserDto } from "../dtos/users.dto";

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
}
