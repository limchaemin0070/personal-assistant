import { ValidationError } from "../../errors/ValidationError";

// Schedule 관련 입력값 검증 모듈

export interface CreateSchedulePayload {
  title?: string;
  memo?: string | null;
  start_date?: string;
  end_date?: string;
  start_time?: string | null;
  end_time?: string | null;
  is_all_day?: boolean;
  notification_enabled?: boolean;
}

export interface UpdateSchedulePayload {
  title?: string;
  memo?: string | null;
  start_date?: string;
  end_date?: string;
  start_time?: string | null;
  end_time?: string | null;
  is_all_day?: boolean;
  notification_enabled?: boolean;
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

export const validateDateOrThrow = (
  date?: string,
  fieldName: string = "date"
) => {
  if (!date) {
    throw new ValidationError(
      `${fieldName === "start_date" ? "시작" : "종료"} 날짜를 입력해주세요.`,
      fieldName
    );
  }
  if (typeof date !== "string") {
    throw new ValidationError(
      `${
        fieldName === "start_date" ? "시작" : "종료"
      } 날짜는 문자열이어야 합니다.`,
      fieldName
    );
  }
  if (!DATE_REGEX.test(date)) {
    throw new ValidationError(
      `${
        fieldName === "start_date" ? "시작" : "종료"
      } 날짜는 YYYY-MM-DD 형식이어야 합니다.`,
      fieldName
    );
  }
  // 유효한 날짜인지 확인
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new ValidationError(
      `${
        fieldName === "start_date" ? "시작" : "종료"
      } 날짜가 유효하지 않습니다.`,
      fieldName
    );
  }
};

export const validateTimeOrThrow = (
  time?: string | null,
  fieldName: string = "time"
) => {
  if (time !== null && time !== undefined) {
    if (typeof time !== "string") {
      throw new ValidationError(
        `${
          fieldName === "start_time" ? "시작" : "종료"
        } 시간은 문자열이어야 합니다.`,
        fieldName
      );
    }
    if (!TIME_REGEX.test(time)) {
      throw new ValidationError(
        `${
          fieldName === "start_time" ? "시작" : "종료"
        } 시간은 HH:MM 또는 HH:MM:SS 형식이어야 합니다.`,
        fieldName
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

export const validateDateRangeOrThrow = (
  startDate: string,
  endDate: string
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    throw new ValidationError(
      "종료 날짜는 시작 날짜보다 이후여야 합니다.",
      "end_date"
    );
  }
};

export const validateCreateSchedulePayload = (
  payload: CreateSchedulePayload
) => {
  const {
    title,
    memo,
    start_date,
    end_date,
    start_time,
    end_time,
    is_all_day,
    notification_enabled,
  } = payload;

  // 필수 필드 검증
  validateTitleOrThrow(title);
  validateDateOrThrow(start_date, "start_date");
  validateDateOrThrow(end_date, "end_date");

  // 선택 필드 검증
  validateMemoOrThrow(memo);
  validateTimeOrThrow(start_time, "start_time");
  validateTimeOrThrow(end_time, "end_time");
  validateBooleanOrThrow(is_all_day, "is_all_day");
  validateBooleanOrThrow(notification_enabled, "notification_enabled");

  // 날짜 범위 검증
  if (start_date && end_date) {
    validateDateRangeOrThrow(start_date, end_date);
  }

  // 종일 일정이 아닌 경우 시간 필수
  if (is_all_day === false) {
    if (!start_time) {
      throw new ValidationError(
        "종일 일정이 아닌 경우 시작 시간을 입력해주세요.",
        "start_time"
      );
    }
    if (!end_time) {
      throw new ValidationError(
        "종일 일정이 아닌 경우 종료 시간을 입력해주세요.",
        "end_time"
      );
    }
  }
};

export const validateUpdateSchedulePayload = (
  payload: UpdateSchedulePayload
) => {
  const {
    title,
    memo,
    start_date,
    end_date,
    start_time,
    end_time,
    is_all_day,
    notification_enabled,
  } = payload;

  // 제공된 필드만 검증
  if (title !== undefined) {
    validateTitleOrThrow(title);
  }
  if (memo !== undefined) {
    validateMemoOrThrow(memo);
  }
  if (start_date !== undefined) {
    validateDateOrThrow(start_date, "start_date");
  }
  if (end_date !== undefined) {
    validateDateOrThrow(end_date, "end_date");
  }
  if (start_time !== undefined) {
    validateTimeOrThrow(start_time, "start_time");
  }
  if (end_time !== undefined) {
    validateTimeOrThrow(end_time, "end_time");
  }
  if (is_all_day !== undefined) {
    validateBooleanOrThrow(is_all_day, "is_all_day");
  }
  if (notification_enabled !== undefined) {
    validateBooleanOrThrow(notification_enabled, "notification_enabled");
  }

  // 날짜 범위 검증 (둘 다 제공된 경우)
  if (start_date && end_date) {
    validateDateRangeOrThrow(start_date, end_date);
  }

  // 종일 일정이 아닌 경우 시간 필수
  // is_all_day가 false로 설정되거나, 이미 false인 상태에서 시간이 null로 설정되는 경우 체크
  if (is_all_day === false) {
    // is_all_day를 false로 변경하는 경우, start_time과 end_time이 제공되어야 함
    if (start_time === null || start_time === undefined) {
      throw new ValidationError(
        "종일 일정이 아닌 경우 시작 시간을 입력해주세요.",
        "start_time"
      );
    }
    if (end_time === null || end_time === undefined) {
      throw new ValidationError(
        "종일 일정이 아닌 경우 종료 시간을 입력해주세요.",
        "end_time"
      );
    }
  }
};
