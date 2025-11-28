import { Request, Response } from "express";
import { emailService } from "../services/email.service";
import { userService } from "../services/user.service";
import { asyncHandler } from "../utils/asyncHandler";
import {
  validateCodeOrThrow,
  validateEmailOrThrow,
  validateNicknameOrThrow,
  validatePasswordOrThrow,
} from "../utils/validation/authValidator";
import { buildSuccess } from "../utils/response";

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
  validateEmailOrThrow(email);
  validatePasswordOrThrow(password);
  validateNicknameOrThrow(nickname);

  // 이메일 인증 여부 체크 & 이미 존재하는 유저인지 중복 체크
  await emailService.isEmailVerified(email);
  await userService.validateEmailNotExists(email);

  // 유저 생성
  const user = await userService.createUser({
    email,
    password,
    nickname,
    notification_enabled: notification_enabled ?? false,
  });

  // 관련 인증 DB 정리
  await emailService.cleanupVerification(email);

  res.status(201).json(
    buildSuccess("SIGNUP_SUCCESS", "회원가입이 완료되었습니다.", {
      email: user.email,
      nickname: user.nickname,
    })
  );
});
