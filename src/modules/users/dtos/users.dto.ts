// Users DTO placeholder.
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
}

export interface UpdateProfileDto {
  name?: string;
  email?: string;
  phone_number?: string;
  password?: string;
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  role: "customer" | "admin";
  createdAt: Date;
  updatedAt: Date;
}
