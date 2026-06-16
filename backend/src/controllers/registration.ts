import {
  getMe,
  getRoomMessages,
  loginService,
  newTokenGeneration,
  registerService,
} from "@/services/register";
import type { User, userWithoutPassword } from "@/types/register.types";
import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "@/types/index.types";
import type { MessageDTO } from "@/types/message.types";

export async function registerController(
  req: Request,
  res: Response<ApiResponse<userWithoutPassword>>,
  next: NextFunction,
) {
  try {
    const input = req.body;

    console.log(req.body);
    const result = await registerService(input);

    return res.json({
      success: true,
      data: result,
      message: null,
    });
  } catch (err) {
    next(err);
  }
}

export async function loginController(
  req: Request,
  res: Response<ApiResponse<string>>,
  next: NextFunction,
) {
  try {
    const input = req.body;
    const { accessToken, refreshToken } = await loginService(input);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    return res.json({
      success: true,
      data: accessToken,
      message: null,
    });
  } catch (err) {
    next(err);
  }
}

export async function tokenGenerationController(
  req: Request,
  res: Response<ApiResponse<{ accessToken: string }>>,
  next: NextFunction,
) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "The user is not authenticated",
      });
    }

    const result = await newTokenGeneration(refreshToken);

    return res.json({
      success: true,
      data: result,
      message: null,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMeController(
  req: Request,
  res: Response<ApiResponse<User | null>>,
  next: NextFunction,
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "The user is not authenticated",
      });
    }

    const user = await getMe(userId);

    res.json({
      success: true,
      data: user,
      message: null,
    });
  } catch (err) {
    console.log("The error is: ", err);
    next(err);
  }
}

export async function getRoomMessagesController(
  req: Request<{ roomId: string }>,
  res: Response<ApiResponse<MessageDTO[]>>,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    const { roomId } = req.params;

    const messages = await getRoomMessages(userId, roomId);

    res.json({
      success: true,
      data: messages,
      message: null,
    });
  } catch (err) {
    next(err);
  }
}
