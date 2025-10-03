import { Router } from "express";
import {
  googleAuthRedirect,
  googleAuthCallback,
} from "../controllers/auth.controller";

const router = Router();

router.get("/google", googleAuthRedirect); // Step 1: redirect to Google login
router.get("/google/callback", googleAuthCallback); // Step 2: handle callback

export default router;
