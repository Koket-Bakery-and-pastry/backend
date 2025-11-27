import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { UserController } from "../controllers/users.controller";
import {
  authenticate,
  authorize,
} from "../../../core/middlewares/auth.middleware";

// Configure multer storage for profile images
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = "uploads/profiles";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const name = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

const router = Router();
const userController = new UserController();

// POST /api/v1/users/register - Register a new user
router.post("/register", userController.registerUser);

// GET /api/v1/users/profile - Get current user's profile (authenticated)
router.get("/profile", authenticate, userController.getProfile);

// PUT /api/v1/users/profile - Update current user's profile (authenticated)
router.put("/profile", authenticate, userController.updateProfile);

// PUT /api/v1/users/profile/image - Update current user's profile image (authenticated)
router.put(
  "/profile/image",
  authenticate,
  upload.single("profile_image"),
  userController.updateProfileImage
);

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

// DELETE /api/v1/users/:id - Delete user by ID (admin only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  userController.deleteUser
);

export default router;
