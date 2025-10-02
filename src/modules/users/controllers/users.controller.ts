import z from "zod";
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../../../core/errors/HttpError";
import { UserService } from "../services/users.service";
import { createUserSchema } from "../validators/users.validator";

// Users controller placeholder.
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body using zod Schema
      const userData = createUserSchema.parse(req.body);

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
