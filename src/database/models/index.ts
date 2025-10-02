import mongoose from "mongoose";
import { Env } from "../../config/env";

export const connectDB = async () => {
  try {
    const mongoUri = Env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGO_URI environment variable is not defined. Please check your .env file."
      );
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
