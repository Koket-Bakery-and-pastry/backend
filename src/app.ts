import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./core/middlewares/error-handler.middleware";
import { HttpError } from "./core/errors/HttpError";
import routes from "./routes/v1";
import openApiDocument from "./docs/openapi";

function testAuthMiddleware(req: any, res: any, next: any) {
  const testUserId = req.header("x-test-user-id");
  if (testUserId) {
    req.user = { id: testUserId, role: "customer" };
  }
  next();
}

const app = express();
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === "test") {
  app.use(testAuthMiddleware);
}
app.use("/api/v1", routes);
try {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
} catch (err) {
  const e: any = err;
  console.warn("Swagger UI not available:", e?.message || e);
}
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use((req, res, next) => {
  next(new HttpError(404, `Not Found - ${req.originalUrl}`));
});
app.use(errorHandler);

export default app;
