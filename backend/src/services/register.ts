import {
  isTokenPayload,
  type loginInput,
  type registerInput,
  type User,
  type userWithoutPassword,
} from "@/types/register.types";
import db from "@/config/db";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "@/utils/tokenGeneration";
import { customError } from "@/utils/customError";
import type { Message } from "@/types/message.types";

export async function registerService(
  input: registerInput,
): Promise<userWithoutPassword> {
  const user = await db.register(input);
  return user;
}

export async function loginService(
  input: loginInput,
): Promise<{ accessToken: string; refreshToken: string }> {
  console.log("Login service here");
  const { accessToken, refreshToken } = await db.login(input);
  return { accessToken, refreshToken };
}

export async function newTokenGeneration(
  refreshToken: string,
): Promise<{ accessToken: string }> {
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);

    console.log("refreshToken decoded: ", decoded);

    if (!isTokenPayload(decoded)) {
      throw new customError(403, "The token is invalid", null);
    }

    const accessToken = generateAccessToken(decoded.sub, decoded.role);

    return { accessToken };
  } catch (err) {
    throw err;
  }
}

export async function getMe(userId: string): Promise<User> {
  const me = await db.getMe(userId);
  return me;
}

export async function getRoomMessages(
  userId: string | undefined,
  roomId: string,
): Promise<Message[]> {
  try {
    if (!userId) {
      throw new customError(401, "The user is not authenticated", null);
    }
  } catch (err) {
    throw err;
  }
  const messages = await db.getMessages(userId, roomId);
  return messages;
}
