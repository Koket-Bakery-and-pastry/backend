import { Router } from "express";
import { UserController } from "../controllers/users.controller";

const router = Router();
const userController = new UserController();

// POST /api/v1/users/register - Register a new user
router.post("/register", userController.registerUser);

export default router;
