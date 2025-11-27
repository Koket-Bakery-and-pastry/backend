import z from "zod";
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../../../core/errors/HttpError";
import { UserService } from "../services/users.service";
import { createUserSchema } from "../validators/users.validator";
import { objectIdSchema } from "../../../core/validators/objectId.validation";
import { AuthRequest } from "../../../core/middlewares/auth.middleware";

// Extend Request to include file from multer
interface RequestWithFile extends AuthRequest {
  file?: Express.Multer.File;
}

// Users controller placeholder.
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Get current user's profile
   */
  getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new HttpError(401, "Unauthorized"));
      }
      const profileData = await this.userService.getProfile(
        req.user.userId.toString()
      );
      res.status(200).json({
        message: "Profile retrieved successfully",
        ...profileData,
      });
    } catch (error: any) {
      next(
        error instanceof HttpError
          ? error
          : new HttpError(500, "Internal Server Error")
      );
    }
  };

  /**
   * Update current user's profile image
   */
  updateProfileImage = async (
    req: RequestWithFile,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        return next(new HttpError(401, "Unauthorized"));
      }

      if (!req.file) {
        return next(new HttpError(400, "Profile image file is required"));
      }

      const imageUrl = `/${req.file.path.replace(/\\/g, "/")}`;
      const user = await this.userService.updateProfileImage(
        req.user.userId.toString(),
        imageUrl
      );

      res.status(200).json({
        message: "Profile image updated successfully",
        user,
      });
    } catch (error: any) {
      next(
        error instanceof HttpError
          ? error
          : new HttpError(500, "Internal Server Error")
      );
    }
  };

  /**
   * Get all users (admin only)
   */
  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json({
        message: "Users retrieved successfully",
        users,
      });
    } catch (error: any) {
      next(
        error instanceof HttpError
          ? error
          : new HttpError(500, "Internal Server Error")
      );
    }
  };

  /**
   * Get user by ID (admin only)
   */
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = objectIdSchema.parse(req.params.id);
      const user = await this.userService.getUserById(id);
      res.status(200).json({
        message: "User retrieved successfully",
        user,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return next(new HttpError(400, "Invalid user ID format"));
      }
      next(
        error instanceof HttpError
          ? error
          : new HttpError(500, "Internal Server Error")
      );
    }
  };

  registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body using zod Schema safely to avoid throwing and ensure
      // we don't call the service when input is invalid.
      const parsed = createUserSchema.safeParse(req.body);
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((i: any) => i.message)
          .join(", ");
        return next(new HttpError(400, issues));
      }
      const userData = parsed.data;

      // call the service layer to register the user
      const newUser = await this.userService.registerUser(userData);

      // Map _id to id for response
      const { _id, ...rest } = newUser as any;
      const userResponse = { id: _id?.toString?.() || _id, ...rest };

      res.status(201).json({
        message: "User registered successfully",
        user: userResponse,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        // Look for missing/invalid email specifically
        const emailIssue = error.issues.find((e: any) =>
          e.path.includes("email")
        );
        if (emailIssue) {
          return next(new HttpError(400, "Invalid email address"));
        }
        return next(
          new HttpError(400, error.issues.map((e: any) => e.message).join(", "))
        );
      }
      // Handle duplicate email error from service
      if (error instanceof HttpError && error.status === 409) {
        return next(new HttpError(409, "User with this email already exists."));
      }
      next(new HttpError(500, "Internal Server Error"));
    }
  };

  /**
   * Deletes a user by ID (admin only).
   */
  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = objectIdSchema.parse(req.params.id);
      await this.userService.deleteUser(id);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return next(new HttpError(400, "Invalid user ID"));
      }
      if (error instanceof HttpError) {
        return next(error);
      }
      next(new HttpError(500, "Internal Server Error"));
    }
  };
}
