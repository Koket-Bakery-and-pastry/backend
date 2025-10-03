// Users DTO placeholder.
export interface CreateUserDto {
  name: string;
  email: string;
  password?: string;
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  createdAt: Date;
  updatedAt: Date;
}
