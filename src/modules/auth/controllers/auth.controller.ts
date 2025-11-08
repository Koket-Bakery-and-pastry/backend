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
        process.env.FRONTEND_URL ||
        "https://frontend-37fhhe7az-nebas-projects-bc66f479.vercel.app"
      ).replace(/\/$/, "");
      const params = new URLSearchParams();

      if (code) params.set("code", code);
      if (result?.tokens.accessToken)
        params.set("accessToken", result.tokens.accessToken);

      if (result?.user) {
        params.set("user", JSON.stringify(result.user));
      }

      if (result?.tokens.refreshToken) {
        params.set("refreshToken", result.tokens.refreshToken);
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
}

export const authController = new AuthController();
