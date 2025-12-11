import { ValidationError } from "../../errors/ValidationError";

// Reminder 관련 입력값 검증 모듈

export interface CreateReminderPayload {
  title?: string;
  memo?: string | null;
  date?: string | null;
  time?: string | null;
  is_all_day?: boolean;
  notification_enabled?: boolean;
}

export interface UpdateReminderPayload {
  title?: string;
  memo?: string | null;
  date?: string | null;
  time?: string | null;
  is_all_day?: boolean;
  is_completed?: boolean;
  notification_enabled?: boolean;
}

export interface UpdateReminderCompletePayload {
  isCompleted: boolean;
}

// 날짜 형식 검증 (YYYY-MM-DD)
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// 시간 형식 검증 (HH:MM:SS 또는 HH:MM)
const TIME_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:([0-5][0-9]))?$/;

export const validateTitleOrThrow = (title?: string) => {
  if (!title) {
    throw new ValidationError("제목을 입력해주세요.", "title");
  }
  if (typeof title !== "string") {
    throw new ValidationError("제목은 문자열이어야 합니다.", "title");
  }
  if (title.trim().length === 0) {
    throw new ValidationError("제목을 입력해주세요.", "title");
  }
  if (title.length > 255) {
    throw new ValidationError("제목은 255자 이하여야 합니다.", "title");
  }
};

export const validateMemoOrThrow = (memo?: string | null) => {
  if (memo !== null && memo !== undefined) {
    if (typeof memo !== "string") {
      throw new ValidationError("메모는 문자열이어야 합니다.", "memo");
    }
    if (memo.length > 500) {
      throw new ValidationError("메모는 500자 이하여야 합니다.", "memo");
    }
  }
};

export const validateDateOrThrow = (date?: string | null) => {
  if (date !== null && date !== undefined) {
    if (typeof date !== "string") {
      throw new ValidationError("날짜는 문자열이어야 합니다.", "date");
    }
    if (!DATE_REGEX.test(date)) {
      throw new ValidationError("날짜는 YYYY-MM-DD 형식이어야 합니다.", "date");
    }
    // 유효한 날짜인지 확인
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new ValidationError("날짜가 유효하지 않습니다.", "date");
    }
  }
};

export const validateTimeOrThrow = (time?: string | null) => {
  if (time !== null && time !== undefined) {
    if (typeof time !== "string") {
      throw new ValidationError("시간은 문자열이어야 합니다.", "time");
    }
    if (!TIME_REGEX.test(time)) {
      throw new ValidationError(
        "시간은 HH:MM 또는 HH:MM:SS 형식이어야 합니다.",
        "time"
      );
    }
  }
};

export const validateBooleanOrThrow = (value: any, fieldName: string) => {
  if (value !== undefined && typeof value !== "boolean") {
    throw new ValidationError(
      `${fieldName}는 불린 값이어야 합니다.`,
      fieldName
    );
  }
};

export const validateCreateReminderPayload = (
  payload: CreateReminderPayload
) => {
  const { title, memo, date, time, is_all_day, notification_enabled } = payload;

  // 필수 필드 검증
  validateTitleOrThrow(title);

  // 선택 필드 검증
  validateMemoOrThrow(memo);
  validateDateOrThrow(date);
  validateTimeOrThrow(time);
  validateBooleanOrThrow(is_all_day, "is_all_day");
  validateBooleanOrThrow(notification_enabled, "notification_enabled");

  // 종일 일정이 아닌 경우 시간 필수
  if (is_all_day === false) {
    if (!time) {
      throw new ValidationError(
        "종일 일정이 아닌 경우 시간을 입력해주세요.",
        "time"
      );
    }
  }
};

export const validateUpdateReminderPayload = (
  payload: UpdateReminderPayload
) => {
  const {
    title,
    memo,
    date,
    time,
    is_all_day,
    is_completed,
    notification_enabled,
  } = payload;

  // 제공된 필드만 검증
  if (title !== undefined) {
    validateTitleOrThrow(title);
  }
  if (memo !== undefined) {
    validateMemoOrThrow(memo);
  }
  if (date !== undefined) {
    validateDateOrThrow(date);
  }
  if (time !== undefined) {
    validateTimeOrThrow(time);
  }
  if (is_all_day !== undefined) {
    validateBooleanOrThrow(is_all_day, "is_all_day");
  }
  if (is_completed !== undefined) {
    validateBooleanOrThrow(is_completed, "is_completed");
  }
  if (notification_enabled !== undefined) {
    validateBooleanOrThrow(notification_enabled, "notification_enabled");
  }

  // 종일 일정이 아닌 경우 시간 필수
  // is_all_day가 false로 설정되거나, 이미 false인 상태에서 시간이 null로 설정되는 경우 체크
  if (is_all_day === false) {
    // is_all_day를 false로 변경하는 경우, time이 제공되어야 함
    if (time === null || time === undefined) {
      throw new ValidationError(
        "종일 일정이 아닌 경우 시간을 입력해주세요.",
        "time"
      );
    }
  }
};

// 리마인더 완료 상태 업데이트 검증
export const validateUpdateReminderCompletePayload = (
  payload: UpdateReminderCompletePayload
) => {
  const { isCompleted } = payload;

  if (isCompleted === undefined) {
    throw new ValidationError("완료 상태를 입력해주세요.", "isCompleted");
  }

  if (typeof isCompleted !== "boolean") {
    throw new ValidationError(
      "완료 상태는 불린 값이어야 합니다.",
      "isCompleted"
    );
  }
};
