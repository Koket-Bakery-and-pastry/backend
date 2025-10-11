// Auth middleware placeholder.
import { Request, Response, NextFunction } from "express";
import { authService } from "../../modules/auth/services/auth.service";
import { Types } from "mongoose";

export interface AuthRequest extends Request {
  user?: {
    userId: Types.ObjectId;
    email: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.substring(7);

    const decoded = authService.verifyToken(token);
    req.user = {
      userId: decoded.userId as Types.ObjectId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const authorize = (allowedRoles) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (allowedRoles !== req.user.role) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};
