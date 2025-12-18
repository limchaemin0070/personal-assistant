import { Request, Response, NextFunction } from "express";
import { InvalidTokenError } from "../errors/AuthError";
import { verifySSEToken } from "../utils/authentication/jwt";

/**
 * SSE 전용 인증 미들웨어
 * 쿼리 스트링의 token을 검증하여 유효한 경우 req.user에 userId를 설정합니다.
 */
export const sseAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.query.token as string;

    if (!token) {
      throw new InvalidTokenError("sse");
    }

    // JWT 기반 SSE 토큰 검증 (Stateless)
    const payload = verifySSEToken(token);

    // req.user에 userId와 email 설정 (notificationStreamHandler에서 사용)
    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
};
