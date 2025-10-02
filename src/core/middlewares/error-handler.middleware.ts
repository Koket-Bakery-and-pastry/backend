// Error handler middleware placeholder.
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/HttpError";

export const errorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
};
