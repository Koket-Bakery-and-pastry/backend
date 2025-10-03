import express, { Request, Response } from "express";
import * as AuthService from "../services/auth.service";

let storedCodeVerifier = "";

export async function googleAuthRedirect(req: Request, res: Response) {
  const { url, codeVerifier } = await AuthService.getGoogleAuthUrl();
  storedCodeVerifier = codeVerifier;
  return res.redirect(url);
}

export async function googleAuthCallback(req: Request, res: Response) {
  try {
    const code = req.query.code as string;
    if (!code) return res.status(400).json({ message: "Missing code" });

    const result = await AuthService.handleGoogleCallback(
      code,
      storedCodeVerifier
    );
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "OAuth failed" });
  }
}
