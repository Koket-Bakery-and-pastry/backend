// Users DTO placeholder.
export interface CreateUserDto {
  name: string;
  email: string;
  password?: string;
}

export interface UpdateProfileDto {
  name?: string;
  email?: string;
  phone_number?: string;
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  createdAt: Date;
  updatedAt: Date;
}
