import { Router } from "express";
import { UserController } from "../controllers/users.controller";
import {
  authenticate,
  authorize,
} from "../../../core/middlewares/auth.middleware";

const router = Router();
const userController = new UserController();

// POST /api/v1/users/register - Register a new user
router.post("/register", userController.registerUser);

// Admin routes
// GET /api/v1/users - Get all users (admin only)
router.get("/", authenticate, authorize("admin"), userController.getAllUsers);

// GET /api/v1/users/:id - Get user by ID (admin only)
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  userController.getUserById
);

export default router;
