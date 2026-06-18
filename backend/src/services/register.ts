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
import type {
  createRoomInput,
  IMessage,
  IRoom,
  MessageDTO,
} from "@/types/message.types";

export async function registerService(
  input: registerInput,
): Promise<{ accessToken: string; user: userWithoutPassword }> {
  const response = await db.register(input);
  return response;
}

export async function loginService(input: loginInput): Promise<{
  accessToken: string;
  refreshToken: string;
  user: userWithoutPassword;
}> {
  const response = await db.login(input);
  return response;
}

export async function newTokenGeneration(
  refreshToken: string,
): Promise<{ accessToken: string }> {
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);

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
): Promise<MessageDTO[]> {
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

export async function getRooms(userId: string | undefined): Promise<IRoom[]> {
  try {
    if (!userId) {
      throw new customError(401, "The user is not authenticated", null);
    }

    const rooms = await db.getRooms(userId);
    return rooms;
  } catch (err) {
    throw err;
  }
}

export async function createRoom(
  input: createRoomInput,
  userId: string | undefined,
): Promise<IRoom> {
  try {
    if (!userId) {
      throw new customError(401, "The user is not authenticated", null);
    }

    const room = await db.createRoom(input, userId);
    return room;
  } catch (err) {
    throw err;
  }
}
