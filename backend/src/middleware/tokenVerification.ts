import type { ApiResponse } from "@/types/index.types";
import { isTokenPayload } from "@/types/register.types";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

console.log("SECRET LENGTH:", process.env.ACCESS_TOKEN_SECRET?.length);

const { TokenExpiredError, JsonWebTokenError } = jwt;

export function verifyToken(
  req: Request,
  res: Response<
    ApiResponse<null | { code: "TOKEN_EXPIRED" | "TOKEN_INVALID" }>
  >,
  next: NextFunction,
) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token)
    return res.status(401).json({
      success: false,
      data: null,
      message: "The user is not authenticated",
    });

  console.log("TOKEN LENGTH:", token.length);
  console.log("TOKEN:", token);

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    console.log("Decoded: ", decoded);
    if (!isTokenPayload(decoded)) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "The user is not authenticated",
      });
    }
    req.userId = decoded.sub;
    req.role = decoded.role;
    return next();
  } catch (err) {
    console.log("Token error is: ", err);
    if (err instanceof TokenExpiredError) {
      return res.status(401).json({
        success: false,
        data: { code: "TOKEN_EXPIRED" },
        message: null,
      });
    }
    if (err instanceof JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        data: { code: "TOKEN_INVALID" },
        message: null,
      });
    }
  }
}
