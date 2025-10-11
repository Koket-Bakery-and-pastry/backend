import { Types } from "mongoose";

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface GoogleAuthDto {
  token: string;
}

export interface GoogleCallbackDto {
  code: string;
}

export interface AuthResponseDto {
  user: {
    id: Types.ObjectId;
    name: string;
    email: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface TokenPayload {
  userId: Types.ObjectId;
  email: string;
  role: string;
}
