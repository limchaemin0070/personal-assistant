import { CustomError } from "./CustomErrors";

// 입력값과 관련된 에러들 처리
// 400

export class ValidationError extends CustomError {
  constructor(message: string, field?: string) {
    super(400, "VALIDATION_ERROR", message, field);
  }
}

export class InvalidEmailFormatError extends CustomError {
  constructor() {
    super(
      400,
      "INVALID_EMAIL_FORMAT",
      "올바른 이메일 형식이 아닙니다.",
      "email"
    );
  }
}

export class EmailServiceUnavailableError extends CustomError {
  constructor() {
    super(
      503,
      "EMAIL_SERVICE_UNAVAILABLE",
      "이메일 발송 서비스에 문제가 생겼습니다. 잠시 후 다시 이용해주세요."
    );
  }
}
