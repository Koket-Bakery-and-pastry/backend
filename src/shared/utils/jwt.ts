import jwt, { SignOptions } from "jsonwebtoken";
import { Env } from "../../config/env";
import { TokenPayload } from "../../modules/auth/dtos/auth.dto";
import { Types } from "mongoose";

const JWT_SECRET = Env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = Env.JWT_EXPIRES_IN || "1h";

export function generateToken(
  payload: TokenPayload,
  options?: SignOptions
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1h",
    ...options,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function decodeToken(token: string): null | TokenPayload {
  return jwt.decode(token) as TokenPayload | null;
}

// Extract token from Authorization header and get userId
export function getUserIdFromAuthHeader(
  authHeader?: string
): Types.ObjectId | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyToken(token);
    return payload.userId as Types.ObjectId;
  } catch {
    return null;
  }
}

// Extract token from Authorization header
export function getTokenFromAuthHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (!decoded || !decoded.exp) return true;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// Get full payload from Authorization header
export function getPayloadFromAuthHeader(
  authHeader?: string
): TokenPayload | null {
  const token = getTokenFromAuthHeader(authHeader);
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
