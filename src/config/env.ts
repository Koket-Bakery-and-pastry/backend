require("dotenv").config();
export const Env = {
  MONGO_URI: process.env.MONGO_URI || "",
  PORT: process.env.PORT || "5000",
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret",
};
