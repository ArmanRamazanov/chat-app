import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "@/types/index.types";

export const validateRegister = (
  req: Request,
  res: Response<ApiResponse<string[]>>,
  next: NextFunction,
) => {
  const { username, password, firstName } = req.body;
  const errors: string[] = [];

  if (!username) errors.push("Username is required");
  if (!password) errors.push("Password is required");
  if (!firstName) errors.push("First name is required");
  if (password && password.length < 8)
    errors.push("Password must be at least 8 characters");

  if (errors.length) {
    return res
      .status(400)
      .json({ success: false, data: errors, message: null });
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { username, password } = req.body;
  const errors: string[] = [];

  if (!username) errors.push("Username is required");
  if (!password) errors.push("Password is required");

  if (errors.length) {
    return res
      .status(400)
      .json({ success: false, data: errors, message: null });
  }

  next();
};
