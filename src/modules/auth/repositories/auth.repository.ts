import UserModel from "../../../database/models/user.model";

export class AuthRepository {
  async findUserByEmail(email: string) {
    return UserModel.findOne({ email }).exec();
  }
  async createUser(userData: {
    name: string;
    email: string;
    passwordHash?: string;
    role?: "customer" | "admin";
    googleId?: string;
  }): Promise<any> {
    return UserModel.create(userData);
  }
}
