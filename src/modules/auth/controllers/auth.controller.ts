import { Request, Response } from "express";
import { authService } from "../services/auth.service";

export class AuthController {
  async googleAuthRedirect(req: Request, res: Response) {
    try {
      const { url /*, state, codeVerifier */ } =
        await authService.getGoogleAuthUrl();
      return res.redirect(url);
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: error.message || "Failed to initiate Google auth" });
    }
  }

  async googleAuthCallback(req: Request, res: Response) {
    try {
      const code = req.query.code as string;
      const state = req.query.state as string;

      if (!code) return res.status(400).json({ message: "Missing code" });
      if (!state) return res.status(400).json({ message: "Missing state" });

      const result = await authService.handleGoogleCallback(code, state);

      // otherwise redirect to frontend with the returned code/token
      const frontendBase = (
        process.env.FRONTEND_URL || "http://localhost:3000"
      ).replace(/\/$/, "");
      const params = new URLSearchParams();

      if (code) params.set("code", code);
      if (result?.tokens.accessToken)
        params.set("accessToken", result.tokens.accessToken);

      if (result?.user) {
        params.set("user", JSON.stringify(result.user));
      }

      if (result?.tokens) {
        params.set("token", JSON.stringify(result.tokens));
      }

      return res.redirect(`${frontendBase}/auth/callback?${params.toString()}`);

      // return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || "OAuth failed" });
    }
  }
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const userId = req.body;

      if (userId === undefined) {
        return res.status(400).json({ message: "User ID is required" });
      }

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      await authService.logout(userId);
      res.status(200).json({ message: "Logged out successfully" });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  async verifyAdmin(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ isAdmin: false, message: "Invalid or expired token" });
      }

      const token = authHeader.substring(7);
      const payload = authService.verifyToken(token);
      const result = await authService.verifyAdmin(payload.userId);

      if (!result.isAdmin) {
        return res
          .status(403)
          .json({ isAdmin: false, message: "Admin privileges required" });
      }

      return res.status(200).json({
        isAdmin: true,
        user: result.user,
      });
    } catch (e: any) {
      const status = e.status || e.statusCode || 401;
      const message =
        e.message === "Invalid token"
          ? "Invalid or expired token"
          : e.message || "Invalid or expired token";
      return res.status(status).json({
        isAdmin: false,
        message,
      });
    }
  }

  /**
   * POST /api/v1/auth/forgot-password
   * Send OTP to user's email
   */
  async forgotPassword(req: Request, res: Response) {
    try {
      await authService.forgotPassword(req.body);
      res.status(200).json({
        message: "If this email exists, an OTP has been sent",
      });
    } catch (e: any) {
      const status = e.statusCode || 500;
      res.status(status).json({ message: e.message });
    }
  }

  /**
   * POST /api/v1/auth/verify-otp
   * Verify OTP code
   */
  async verifyOtp(req: Request, res: Response) {
    try {
      const result = await authService.verifyOtp(req.body);
      res.status(200).json(result);
    } catch (e: any) {
      const status = e.statusCode || 400;
      res.status(status).json({ message: e.message });
    }
  }

  /**
   * POST /api/v1/auth/reset-password
   * Reset password with OTP
   */
  async resetPassword(req: Request, res: Response) {
    try {
      await authService.resetPassword(req.body);
      res.status(200).json({
        message: "Password reset successfully",
      });
    } catch (e: any) {
      const status = e.statusCode || 400;
      res.status(status).json({ message: e.message });
    }
  }
}

export const authController = new AuthController();
