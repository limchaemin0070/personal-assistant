import { CustomError } from "./CustomErrors";

// 비즈니스 로직 관련 에러

export class EmailAlreadyExistsError extends CustomError {
  constructor() {
    super(409, "EMAIL_ALREADY_EXISTS", "이미 사용 중인 이메일입니다.", "email");
  }
}

export class EmailNotVerifiedError extends CustomError {
  constructor() {
    super(400, "EMAIL_NOT_VERIFIED", "이메일 인증이 완료되지 않았습니다.");
  }
}

export class VerificationCodeExpiredError extends CustomError {
  constructor() {
    super(400, "VERIFICATION_CODE_EXPIRED", "인증 정보가 만료되었습니다.");
  }
}

export class InvalidVerificationCodeError extends CustomError {
  constructor() {
    super(400, "INVALID_VERIFICATION_CODE", "인증 코드가 일치하지 않습니다.");
  }
}

export class UserNotFoundError extends CustomError {
  constructor() {
    super(404, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다.");
  }
}

export class ScheduleNotFoundError extends CustomError {
  constructor() {
    super(404, "SCHEDULE_NOT_FOUND", "일정을 찾을 수 없습니다.");
  }
}

export class ReminderNotFoundError extends CustomError {
  constructor() {
    super(404, "REMINDER_NOT_FOUND", "리마인더를 찾을 수 없습니다.");
  }
}
