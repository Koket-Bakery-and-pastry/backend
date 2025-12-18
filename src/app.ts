// app.ts
import express from "express";
import cors from "cors";
import session from "express-session"; // Add this
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./core/middlewares/error-handler.middleware";
import { HttpError } from "./core/errors/HttpError";
import routes from "./routes/v1";
import openApiDocument from "./docs/openapi";
import path from "path";

function testAuthMiddleware(req: any, res: any, next: any) {
  const testUserId = req.header("x-test-user-id");
  if (testUserId) {
    req.user = { id: testUserId, role: "customer" };
  }
  next();
}

const app = express();

const allowedOrigins = [
  "https://koket-bakery.com",
  "https://www.koket-bakery.com",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "http://localhost:5001",
  "http://backend.koket-bakery.com",
  "https://backend.koket-bakery.com",
];

app.use(
  cors({
    origin: [
      "https://koket-bakery.com",
      "https://www.koket-bakery.com",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 15,
    },
  })
);

app.use(express.json());

// Add session middleware
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "your-secret-key",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "none",
//       maxAge: 1000 * 60 * 15, // 15 minutes
//     },
//   })
// );

app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "public")));

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
