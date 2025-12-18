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
  constructor(tokenType: "access" | "refresh" | "sse" = "access") {
    let message = "토큰이 만료되었습니다.";
    if (tokenType === "access") message = "액세스 토큰이 만료되었습니다.";
    else if (tokenType === "refresh")
      message = "리프레시 토큰이 만료되었습니다.";
    else if (tokenType === "sse") message = "SSE 토큰이 만료되었습니다.";

    super(401, "TOKEN_EXPIRED", message);
  }
}

export class InvalidTokenError extends CustomError {
  constructor(tokenType: "access" | "refresh" | "sse" = "access") {
    let message = "토큰이 유효하지 않습니다.";
    if (tokenType === "access") message = "액세스 토큰이 유효하지 않습니다.";
    else if (tokenType === "refresh")
      message = "리프레시 토큰이 유효하지 않습니다.";
    else if (tokenType === "sse")
      message = "SSE 토큰이 유효하지 않거나 만료되었습니다.";

    super(401, "INVALID_TOKEN", message);
  }
}
