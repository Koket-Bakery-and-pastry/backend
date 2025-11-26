import z from "zod";
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../../../core/errors/HttpError";
import { UserService } from "../services/users.service";
import { createUserSchema } from "../validators/users.validator";
import { objectIdSchema } from "../../../core/validators/objectId.validation";

// Users controller placeholder.
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

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
}
