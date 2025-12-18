import { Request, Response } from "express";
import { emailService } from "../services/email.service";
import { asyncHandler } from "../utils/asyncHandler";
import {
  validateCodeOrThrow,
  validateEmailOrThrow,
  validateNicknameOrThrow,
  validateSignUpPayload,
  validateRefreshTokenOrThrow,
} from "../utils/validation/authValidator";
import { ValidationError } from "../errors/ValidationError";
import { buildSuccess } from "../utils/response";
import { env } from "../config/env";
import { authService } from "../services/auth.service";
import {
  getAuthCookieOptions,
  getRefreshCookieOptions,
} from "../utils/authentication/cookie";

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
  // 비밀번호는 입력만 되면 됨 (형식 검사 없음)
  if (!password || !password.trim()) {
    throw new ValidationError("비밀번호를 입력해주세요.", "password");
  }

  const { user, accessToken, refreshToken } = await authService.login(
    email,
    password
  );

  // 액세스토큰과 리프레시토큰 모두 httponly 쿠키에 저장
  res.cookie(
    "accessToken",
    accessToken,
    getAuthCookieOptions(env.JWT_ACCESS_EXPIRES_IN)
  );

  res.cookie(
    "refreshToken",
    refreshToken,
    getAuthCookieOptions(env.JWT_REFRESH_EXPIRES_IN)
  );

  res.status(200).json(
    buildSuccess("LOGIN_SUCCESS", "로그인에 성공했습니다.", {
      email: user.email,
      nickname: user.nickname,
    })
  );
});

// 로그아웃
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const cookieOptions = getAuthCookieOptions();

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

    try {
      // 액세스토큰과 리프레시토큰 둘 다 새로 발급
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await authService.refreshTokens(refreshToken);

      res.cookie(
        "accessToken",
        newAccessToken,
        getRefreshCookieOptions(env.JWT_ACCESS_EXPIRES_IN)
      );

      res.cookie(
        "refreshToken",
        newRefreshToken,
        getRefreshCookieOptions(env.JWT_REFRESH_EXPIRES_IN)
      );

      res
        .status(200)
        .json(
          buildSuccess(
            "REFRESH_SUCCESS",
            "액세스 토큰 재발급에 성공했습니다.",
            null
          )
        );
    } catch (error) {
      // 리프레시 토큰이 유효하지 않은 경우 쿠키 삭제
      const cookieOptions = getRefreshCookieOptions();
      res.clearCookie("accessToken", cookieOptions);
      res.clearCookie("refreshToken", cookieOptions);
      throw error;
    }
  }
);
