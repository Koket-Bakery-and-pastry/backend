import express from "express";
import cors from "cors";
import { errorHandler } from "./core/middlewares/error-handler.middleware";
import { HttpError } from "./core/errors/HttpError";
import routes from "./routes/v1";

// Test-only middleware to inject req.user when running tests
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
// Mount test-only auth middleware when running in test environment
if (process.env.NODE_ENV === "test") {
  app.use(testAuthMiddleware);
}
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
