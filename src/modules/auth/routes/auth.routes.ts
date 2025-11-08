import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import {
  authenticate,
  authorize,
} from "../../../core/middlewares/auth.middleware";

const router = Router();

router.get("/google", authController.googleAuthRedirect);
router.get("/google/callback", authController.googleAuthCallback);
router.post("/register", authController.register);
router.get("/test", authorize("admin"), (req, res) => {
  res.send("Auth route is working");
});
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authenticate, authController.logout);

export default router;
