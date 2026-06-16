import jwt from "jsonwebtoken";
import { Types } from "mongoose";

export interface registerInput {
  username: string;
  password: string;
  firstName: string;
}

export interface loginInput {
  username: string;
  password: string;
}

export enum Role {
  Admin = "admin",
  User = "user",
}

export interface User {
  username: string;
  password: string;
  role: Role;
  rooms: Types.ObjectId[];
  isOnline: boolean;
  profile: {
    firstName: string;
    surname: string | null;
    bio: string | null;
  };
}

export interface tokenPayload extends jwt.JwtPayload {
  sub: string;
  role: string;
  jti: string;
}

export function isTokenPayload(payload: unknown): payload is tokenPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "role" in payload &&
    "sub" in payload &&
    "jti" in payload
  );
}

export type userWithoutPassword = Omit<User, "password">;
