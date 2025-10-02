import UserModel from "../../../database/models/user.model";

export class AuthRepository {
  async findUserByEmail(email: string) {
    return UserModel.findOne({ email });
  }
  async createUser(userData: {
    name: string;
    email: string;
    passwordHash?: string;
    role?: "customer" | "admin";
    googleId?: string;
  }) {
    return UserModel.create(userData);
  }
}
