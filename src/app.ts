import express from "express";
import cors from "cors";
import { errorHandler } from "./core/middlewares/error-handler.middleware";
import { HttpError } from "./core/errors/HttpError";
import routes from "./routes/v1";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1", routes);
app.get("/", (req, res) => {
  res.send("API is running...");
});

// 404 handler
app.use((req, res, next) => {
  next(new HttpError(404, `Not Found - ${req.originalUrl}`));
});
app.use(errorHandler);

export default app;
