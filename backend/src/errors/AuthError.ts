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

export class TokenExpiredError extends CustomError {
  constructor(tokenType: "access" | "refresh" = "access") {
    super(
      401,
      "TOKEN_EXPIRED",
      `${tokenType === "access" ? "액세스" : "리프레시"} 토큰이 만료되었습니다.`
    );
  }
}

export class InvalidTokenError extends CustomError {
  constructor(tokenType: "access" | "refresh" = "access") {
    super(
      401,
      "INVALID_TOKEN",
      `${
        tokenType === "access" ? "액세스" : "리프레시"
      } 토큰이 유효하지 않습니다.`
    );
  }
}
