import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/CustomErrors";
import { verifyAccessToken } from "../utils/authentication/jwt";
import { InvalidTokenError } from "../errors/AuthError";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.accessToken;

  // 액세스 토큰 없음
  if (!token) {
    throw new InvalidTokenError("access");
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};
