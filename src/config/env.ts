require("dotenv").config();
export const Env = {
  MONGO_URI: process.env.MONGO_URI || "",
  PORT: process.env.PORT || "5000",
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || "your_jwt_refresh_secret",
  ADMIN_NAME: process.env.ADMIN_NAME || "Admin",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "email@admin.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "admins",
  ADMIN_PHONE_NUMBER: process.env.ADMIN_PHONE_NUMBER || "",
};
