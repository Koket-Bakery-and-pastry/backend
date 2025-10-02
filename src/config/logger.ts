import winston from "winston";
import path from "path";
import { Env } from "./env";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}] ${stack || message}`;
});

const logger = winston.createLogger({
  level: Env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" })
  ),
  transports: [
    // 📁 Error logs
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
      format: combine(json()),
    }),
    // 📁 All logs
    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
      format: combine(json()),
    }),
  ],
});

if (Env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), consoleFormat),
    })
  );
}

export default logger;
