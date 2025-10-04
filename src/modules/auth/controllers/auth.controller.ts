import { Request, Response } from "express";
import { authService } from "../services/auth.service";

export class AuthController {
  private storedCodeVerifier = "";

  async googleAuthRedirect(req: Request, res: Response) {
    const { url, codeVerifier } = await authService.getGoogleAuthUrl();
    this.storedCodeVerifier = codeVerifier;
    return res.redirect(url);
  }

  async googleAuthCallback(req: Request, res: Response) {
    try {
      const code = req.query.code as string;
      if (!code) return res.status(400).json({ message: "Missing code" });

      const result = await authService.handleGoogleCallback(
        code,
        this.storedCodeVerifier
      );
      return res.json(result);
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
