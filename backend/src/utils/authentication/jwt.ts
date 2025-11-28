import jwt, {
  SignOptions,
  TokenExpiredError as JwtTokenExpiredError,
  JsonWebTokenError,
} from "jsonwebtoken";
import { env } from "../../config/env";
import { TokenExpiredError, InvalidTokenError } from "../../errors/AuthError";

export interface TokenPayload {
  userId: number;
  email: string;
}

export function expiresInToMs(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match || !match[1] || !match[2]) {
    throw new Error(`Invalid expiresIn format: ${expiresIn}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const multiplier = multipliers[unit];
  if (!multiplier) {
    throw new Error(`Unsupported time unit: ${unit}`);
  }

  return value * multiplier;
}

// 액세스 토큰 생성
export function generateAccessToken(payload: TokenPayload): string {
  const options = {
    algorithm: "HS256",
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as SignOptions;
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

// 리프레시 토큰 생성
export function generateRefreshToken(payload: TokenPayload): string {
  const options = {
    algorithm: "HS256",
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions;
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

// 액세스 토큰 검증
export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
  } catch (error) {
    if (error instanceof JwtTokenExpiredError) {
      throw new TokenExpiredError("access");
    }
    if (error instanceof JsonWebTokenError) {
      throw new InvalidTokenError("access");
    }
    throw new InvalidTokenError("access");
  }
}

// 리프레시 토큰 검증
export function verifyRefreshToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    if (error instanceof JwtTokenExpiredError) {
      throw new TokenExpiredError("refresh");
    }
    if (error instanceof JsonWebTokenError) {
      throw new InvalidTokenError("refresh");
    }
    throw new InvalidTokenError("refresh");
  }
}
