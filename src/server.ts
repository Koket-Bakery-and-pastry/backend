import { Env } from "./config/env";
import { connectDB } from "./database/models";
import app from "./app"; // Import our configured Express app

const start = async () => {
  try {
    await connectDB(); // Connect to the database first
    console.log("☑ Connected to MongoDB");

    app.listen(Env.PORT, () => {
      console.log(`🚀 Server running on port ${Env.PORT}`);
      console.log(
        `OpenAPI/Swagger docs will be available at /api-docs (once implemented)`
      );
    });
  } catch (error) {
    console.error("✖ Failed to start server:", error);
    process.exit(1); // Exit process with failure
  }
};

start();
