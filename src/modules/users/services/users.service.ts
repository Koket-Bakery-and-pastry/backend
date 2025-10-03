import { HttpError } from "../../../core/errors/HttpError";
import { IUser } from "../../../database/models/user.model";
import { CreateUserDto } from "../dtos/users.dto";
import { UserRepository } from "../repositories/users.repository";
import * as bcrypt from "bcrypt";

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
    const { name, email, password } = userData;

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
    } as any);
    const { password_hash: _, ...userWithoutHash } = newUser.toObject();
    return userWithoutHash;
  }
}
