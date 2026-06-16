import type { Request, Response, NextFunction } from "express";
import { customError } from "@/utils/customError";
import { MongooseError } from "mongoose";

export async function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof customError) {
    return res.status(error.code).json({
      success: false,
      data: error.details || null,
      message: error.message || null,
    });
  }
  res.status(500).json({ message: "Something went wrong" });
}
