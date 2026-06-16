import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export function generateAccessToken(id: string, role: string) {
  const jti = uuidv4();
  const payload = {
    sub: id,
    role,
    jti,
  };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });

  return accessToken;
}

export function generateRefreshToken(id: string, role: string) {
  const jti = uuidv4();
  const payload = {
    id,
    role,
    jti,
  };

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });

  return refreshToken;
}
