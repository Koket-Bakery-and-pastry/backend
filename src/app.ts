import express from "express";
import cors from "cors";
import { errorHandler } from "./core/middlewares/error-handler.middleware";
// import routes from "./routes/v1";

const app = express();
app.use(cors());
app.use(express.json());
// app.use("/api/v1", routes);
app.use(errorHandler);

export default app;
