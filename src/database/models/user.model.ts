import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password_hash: string;
  role: "customer" | "admin";
  refresh_token?: string;
  googleId: string;
  profile_image_url?: string;
  phone_number?: string;
  password_reset_otp?: string;
  password_reset_otp_expires?: Date;
  password_reset_token?: string;
  password_reset_token_expires?: Date;
  otp_request_count?: number;
  last_otp_request?: Date;
  created_at: Date;
  updated_at: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer",
  },
  refresh_token: {
    type: String,
  },
  googleId: {
    type: String,
    default: "",
  },
  profile_image_url: {
    type: String,
  },
  phone_number: {
    type: String,
    trim: true,
  },
  password_reset_otp: {
    type: String,
  },
  password_reset_otp_expires: {
    type: Date,
  },
  password_reset_token: {
    type: String,
  },
  password_reset_token_expires: {
    type: Date,
  },
  otp_request_count: {
    type: Number,
    default: 0,
  },
  last_otp_request: {
    type: Date,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

const User = model<IUser>("User", userSchema);

export default User;
