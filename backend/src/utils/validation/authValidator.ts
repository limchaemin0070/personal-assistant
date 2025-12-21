import { z } from "zod";
import { ValidationError } from "../../errors/ValidationError";
import { validateWithZod } from "./zodErrorHandler";

// 이메일 정규식
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 이메일 검증 스키마
const emailSchema = z
  .string()
  .min(1, "이메일을 입력해주세요.")
  .regex(EMAIL_REGEX, "올바른 이메일 형식이 아닙니다.");

// 인증번호 검증 스키마 (6자리 숫자)
const codeSchema = z
  .string()
  .min(1, "인증번호를 입력해주세요.")
  .regex(/^\d{6}$/, "인증 번호는 6자리 숫자여야 합니다.");

// 비밀번호 검증 스키마
const passwordSchema = z
  .string()
  .min(1, "비밀번호가 누락되었습니다.")
  .min(8, "비밀번호는 최소 8자 이상이어야 합니다.");

// 닉네임 검증 스키마
const nicknameSchema = z
  .string()
  .min(1, "닉네임이 누락되었습니다.")
  .min(1, "닉네임은 1자 이상 10자 이하여야 합니다.")
  .max(10, "닉네임은 1자 이상 10자 이하여야 합니다.")
  .refine(
    (val) => val.trim().length >= 1,
    "닉네임은 공백만으로 구성될 수 없습니다."
  );

// 회원가입 스키마
const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  nickname: nicknameSchema,
});

// 리프레시 토큰 검증 스키마
const refreshTokenSchema = z
  .string()
  .min(1, "리프레시 토큰이 누락되었습니다.")
  .refine((val) => val.trim().length > 0, "리프레시 토큰이 유효하지 않습니다.");

// 타입 정의
export type SignUpPayload = z.infer<typeof signUpSchema>;

// export const validateEmailOrThrow = (email?: string) => {
//   validateWithZod(emailSchema, email);
// };

// export const validateCodeOrThrow = (code?: string) => {
//   validateWithZod(codeSchema, code);
// };

// export const validatePasswordOrThrow = (password?: string) => {
//   validateWithZod(passwordSchema, password);
// };

// export const validateNicknameOrThrow = (nickname?: string) => {
//   validateWithZod(nicknameSchema, nickname);
// };

// export const validateSignUpPayload = (payload: unknown) => {
//   validateWithZod(signUpSchema, payload);
// };

// export const validateRefreshTokenOrThrow = (refreshToken?: string) => {
//   validateWithZod(refreshTokenSchema, refreshToken);
// };
