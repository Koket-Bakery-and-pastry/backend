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
