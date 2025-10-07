import { Env } from "./config/env";
import { connectDB } from "./database/models";
import app from "./app"; // Import our configured Express app
import { authService } from "./modules/auth/services/auth.service";

const start = async () => {
  try {
    await connectDB(); // Connect to the database first
    console.log("☑ Connected to MongoDB");
    const admin = await authService.createAdmin(
      Env.ADMIN_NAME,
      Env.ADMIN_EMAIL,
      Env.ADMIN_PASSWORD
    );
    console.log(admin ? "☑ Admin user ensured" : "☑ Admin user already exists");

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
