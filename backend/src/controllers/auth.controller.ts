import { Request, Response } from "express";
import { emailService } from "../services/email.service";
import { asyncHandler } from "../utils/asyncHandler";
import {
  validateCodeOrThrow,
  validateEmailOrThrow,
  validateNicknameOrThrow,
  validatePasswordOrThrow,
  validateSignUpPayload,
  validateRefreshTokenOrThrow,
} from "../utils/validation/authValidator";
import { buildSuccess } from "../utils/response";
import { expiresInToMs } from "../utils/authentication/jwt";
import { env } from "../config/env";
import { authService } from "../services/auth.service";

// 이메일 검증 코드 전송
export const sendVerificationCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    // 입력값 검증
    validateEmailOrThrow(email);

    const result = await emailService.sendVerificationCode(email);
    const { email: verifiedEmail, expires_at, message } = result;

    res.status(200).json(
      buildSuccess("AUTH_EMAIL_SENT", message, {
        email: verifiedEmail,
        expires_at,
      })
    );
  }
);

// 사용자가 입력한 코드 일치 검사
export const verifyCode = asyncHandler(async (req: Request, res: Response) => {
  const { email, code } = req.body;

  // 입력값 검증
  validateEmailOrThrow(email);
  validateCodeOrThrow(code);

  const result = await emailService.verifyCode(email, code);
  const { email: verifiedEmail, message } = result;

  res.status(200).json(
    buildSuccess("AUTH_CODE_VERIFIED", message, {
      email: verifiedEmail,
    })
  );
});

// 회원가입
export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, nickname, notification_enabled } = req.body;

  // 입력값 검증
  validateSignUpPayload({ email, password, nickname });

  const { user } = await authService.signUp({
    email,
    password,
    nickname,
    notification_enabled,
  });

  res.status(201).json(
    buildSuccess("SIGNUP_SUCCESS", "회원가입이 완료되었습니다.", {
      email: user.email,
      nickname: user.nickname,
    })
  );
});

// 로그인
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 입력값 검증
  validateEmailOrThrow(email);
  validatePasswordOrThrow(password);

  const { user, accessToken, refreshToken } = await authService.login(
    email,
    password
  );

  // 액세스토큰과 리프레시토큰 모두 httponly 쿠키에 저장합니다
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: expiresInToMs(env.JWT_ACCESS_EXPIRES_IN),
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: expiresInToMs(env.JWT_REFRESH_EXPIRES_IN),
    path: "/",
  });

  res.status(200).json(
    buildSuccess("LOGIN_SUCCESS", "로그인에 성공했습니다.", {
      email: user.email,
      nickname: user.nickname,
    })
  );
});

// 로그아웃
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
  };

  // 액세스 토큰 쿠키 삭제
  res.clearCookie("accessToken", cookieOptions);

  // 리프레시 토큰 쿠키 삭제
  res.clearCookie("refreshToken", cookieOptions);

  res
    .status(200)
    .json(buildSuccess("LOGOUT_SUCCESS", "로그아웃되었습니다.", null));
});

// 리프레시 토큰을 이용해 액세스 토큰 갱신
export const refreshAccesstoken = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;

    // 입력값 검증
    validateRefreshTokenOrThrow(refreshToken);

    // 액세스토큰과 리프레시토큰 둘 다 새로 발급
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await authService.refreshTokens(refreshToken);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: expiresInToMs(env.JWT_ACCESS_EXPIRES_IN),
      path: "/",
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: expiresInToMs(env.JWT_REFRESH_EXPIRES_IN),
      path: "/",
    });

    res
      .status(200)
      .json(
        buildSuccess(
          "REFRESH_SUCCESS",
          "액세스 토큰 재발급에 성공했습니다.",
          null
        )
      );
  }
);
