import { CustomError } from "./CustomErrors";

// 인증, 인가와 관련된 에러

export class InvalidCredentialsError extends CustomError {
  constructor() {
    super(
      401,
      "INVALID_CREDENTIALS",
      "이메일 또는 비밀번호가 올바르지 않습니다."
    );
  }
}
