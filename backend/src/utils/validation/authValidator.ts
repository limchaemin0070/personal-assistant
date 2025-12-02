import { ValidationError } from "../../errors/ValidationError";

// 필수 필드 입력값을 검증하는 모듈

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SignUpPayload {
  email?: string;
  password?: string;
  nickname?: string;
  notification_enabled?: boolean;
}

export const validateEmailOrThrow = (email?: string) => {
  if (!email) {
    throw new ValidationError("이메일을 입력해주세요.", "email");
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new ValidationError("올바른 이메일 형식이 아닙니다.", "email");
  }
};

export const validateCodeOrThrow = (code?: string) => {
  if (!code) {
    throw new ValidationError("인증번호를 입력해주세요.", "code");
  }
  if (!/^\d{6}$/.test(code)) {
    throw new ValidationError("인증 번호는 6자리 숫자여야 합니다.", "code");
  }
};

export const validatePasswordOrThrow = (password?: string) => {
  if (!password) {
    throw new ValidationError("비밀번호가 누락되었습니다.", "password");
  }
  if (password.length < 8) {
    throw new ValidationError(
      "비밀번호는 최소 8자 이상이어야 합니다.",
      "password"
    );
  }
};

export const validateNicknameOrThrow = (nickname?: string) => {
  if (!nickname) {
    throw new ValidationError("닉네임이 누락되었습니다.", "nickname");
  }
  if (nickname.length < 1 || nickname.length > 10) {
    throw new ValidationError(
      "닉네임은 1자 이상 10자 이하여야 합니다.",
      "nickname"
    );
  }
};

export const validateSignUpPayload = (payload: SignUpPayload) => {
  const { email, password, nickname } = payload;
  validateEmailOrThrow(email);
  validatePasswordOrThrow(password);
  validateNicknameOrThrow(nickname);
};

export const validateRefreshTokenOrThrow = (refreshToken?: string) => {
  if (!refreshToken) {
    throw new ValidationError(
      "리프레시 토큰이 누락되었습니다.",
      "refreshToken"
    );
  }
  if (typeof refreshToken !== "string" || refreshToken.trim().length === 0) {
    throw new ValidationError(
      "리프레시 토큰이 유효하지 않습니다.",
      "refreshToken"
    );
  }
};
