import { CookieOptions } from "express";
import { env } from "../../config/env";
import { expiresInToMs } from "./jwt";

/**
 * 기본 인증 쿠키 옵션 (로그인, 로그아웃 시 사용)
 */
export const getAuthCookieOptions = (expiresIn?: string): CookieOptions => ({
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: expiresIn ? expiresInToMs(expiresIn) : undefined,
  path: "/",
});

/**
 * 토큰 갱신 시 사용하는 쿠키 옵션
 */
export const getRefreshCookieOptions = (expiresIn?: string): CookieOptions => ({
  httpOnly: true,
  //   secure: env.NODE_ENV === "production",
  secure: true,
  sameSite: "none",
  maxAge: expiresIn ? expiresInToMs(expiresIn) : undefined,
  path: "/",
});
