import { ValidationError } from "../../errors/ValidationError";

// Alarm 관련 입력값 검증 모듈

export interface CreateAlarmPayload {
  title?: string;
  date?: string | null;
  time?: string;
  is_repeat?: boolean;
  repeat_days?: number[] | null;
  is_active?: boolean;
  alarm_type?: "repeat" | "once";
}

export interface UpdateAlarmPayload {
  title?: string;
  date?: string | null;
  time?: string;
  is_repeat?: boolean;
  repeat_days?: number[] | null;
  is_active?: boolean;
  alarm_type?: "repeat" | "once";
}

export interface UpdateAlarmActivePayload {
  isActive: boolean;
}

// 시간 형식 검증 (HH:MM:SS 또는 HH:MM)
const TIME_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:([0-5][0-9]))?$/;

// 요일 배열 검증 (0-6, 중복 없음)
const validateRepeatDaysOrThrow = (repeatDays?: number[] | null) => {
  if (repeatDays !== null && repeatDays !== undefined) {
    if (!Array.isArray(repeatDays)) {
      throw new ValidationError(
        "반복 요일은 배열이어야 합니다.",
        "repeat_days"
      );
    }
    if (repeatDays.length === 0) {
      throw new ValidationError(
        "반복 요일은 최소 1개 이상이어야 합니다.",
        "repeat_days"
      );
    }
    if (repeatDays.length > 7) {
      throw new ValidationError(
        "반복 요일은 최대 7개까지 가능합니다.",
        "repeat_days"
      );
    }
    // 중복 체크
    const uniqueDays = new Set(repeatDays);
    if (uniqueDays.size !== repeatDays.length) {
      throw new ValidationError(
        "반복 요일에 중복된 값이 있습니다.",
        "repeat_days"
      );
    }
    // 유효한 요일 값인지 확인 (0-6)
    for (const day of repeatDays) {
      if (
        typeof day !== "number" ||
        day < 0 ||
        day > 6 ||
        !Number.isInteger(day)
      ) {
        throw new ValidationError(
          "반복 요일은 0(일요일)부터 6(토요일)까지의 정수여야 합니다.",
          "repeat_days"
        );
      }
    }
  }
};

export const validateTimeOrThrow = (time?: string) => {
  if (!time) {
    throw new ValidationError("시간을 입력해주세요.", "time");
  }
  if (typeof time !== "string") {
    throw new ValidationError("시간은 문자열이어야 합니다.", "time");
  }
  if (!TIME_REGEX.test(time)) {
    throw new ValidationError(
      "시간은 HH:MM 또는 HH:MM:SS 형식이어야 합니다.",
      "time"
    );
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

export const validateAlarmTypeOrThrow = (alarmType?: "repeat" | "once") => {
  if (!alarmType) {
    throw new ValidationError("알람 타입을 입력해주세요.", "alarm_type");
  }
  if (alarmType !== "repeat" && alarmType !== "once") {
    throw new ValidationError(
      "알람 타입은 'repeat' 또는 'once'여야 합니다.",
      "alarm_type"
    );
  }
};

export const validateIntegerOrThrow = (
  value: any,
  fieldName: string,
  allowNull: boolean = false
) => {
  if (value === null && allowNull) {
    return;
  }
  if (value !== null && value !== undefined) {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
      throw new ValidationError(
        `${fieldName}는 양의 정수여야 합니다.`,
        fieldName
      );
    }
  }
};

// 제목 검증 (선택사항)
export const validateTitleOrThrow = (title?: string | null) => {
  // title이 제공된 경우에만 검증
  if (title !== undefined && title !== null) {
    if (typeof title !== "string") {
      throw new ValidationError("알람 제목은 문자열이어야 합니다.", "title");
    }
    if (title.length > 255) {
      throw new ValidationError(
        "알람 제목은 최대 255자까지 가능합니다.",
        "title"
      );
    }
  }
};

export const validateCreateAlarmPayload = (payload: CreateAlarmPayload) => {
  const { title, date, time, is_repeat, repeat_days, is_active, alarm_type } =
    payload;

  // 필수 필드 검증
  validateTimeOrThrow(time);
  validateAlarmTypeOrThrow(alarm_type);

  // 선택 필드 검증
  validateTitleOrThrow(title);

  // 선택 필드 검증
  validateBooleanOrThrow(is_repeat, "is_repeat");
  validateBooleanOrThrow(is_active, "is_active");
  validateRepeatDaysOrThrow(repeat_days);

  // 반복 알람인 경우 repeat_days 필수
  if (is_repeat === true) {
    if (!repeat_days || repeat_days.length === 0) {
      throw new ValidationError(
        "반복 알람인 경우 반복 요일을 입력해주세요.",
        "repeat_days"
      );
    }
  } else if (is_repeat === false) {
    // 반복 알람이 아닌 경우 repeat_days는 null이어야 함
    if (repeat_days !== null && repeat_days !== undefined) {
      throw new ValidationError(
        "반복 알람이 아닌 경우 반복 요일을 입력할 수 없습니다.",
        "repeat_days"
      );
    }
  }
};

export const validateUpdateAlarmPayload = (payload: UpdateAlarmPayload) => {
  const { title, date, time, is_repeat, repeat_days, is_active, alarm_type } =
    payload;

  // 제공된 필드만 검증
  if (title !== undefined) {
    validateTitleOrThrow(title);
  }
  if (time !== undefined) {
    validateTimeOrThrow(time);
  }
  if (alarm_type !== undefined) {
    validateAlarmTypeOrThrow(alarm_type);
  }
  if (is_repeat !== undefined) {
    validateBooleanOrThrow(is_repeat, "is_repeat");
  }
  if (is_active !== undefined) {
    validateBooleanOrThrow(is_active, "is_active");
  }
  if (repeat_days !== undefined) {
    validateRepeatDaysOrThrow(repeat_days);
  }

  // 반복 알람 관련 검증
  if (is_repeat !== undefined) {
    if (is_repeat === true) {
      if (!repeat_days || repeat_days.length === 0) {
        throw new ValidationError(
          "반복 알람인 경우 반복 요일을 입력해주세요.",
          "repeat_days"
        );
      }
    } else if (is_repeat === false) {
      if (repeat_days !== null && repeat_days !== undefined) {
        throw new ValidationError(
          "반복 알람이 아닌 경우 반복 요일을 입력할 수 없습니다.",
          "repeat_days"
        );
      }
    }
  } else if (repeat_days !== undefined) {
    // is_repeat가 제공되지 않았지만 repeat_days가 제공된 경우
    // 기존 is_repeat 값과의 일관성은 서비스 레이어에서 확인
    if (repeat_days !== null && repeat_days.length > 0) {
      // repeat_days가 제공된 경우, is_repeat는 true여야 함
      // 하지만 여기서는 is_repeat가 undefined일 수 있으므로 경고만
    }
  }
};

// 알람 활성 상태 업데이트 검증
export const validateUpdateAlarmActivePayload = (
  payload: UpdateAlarmActivePayload
) => {
  const { isActive } = payload;

  if (isActive === undefined) {
    throw new ValidationError("활성 상태를 입력해주세요.", "isActive");
  }

  if (typeof isActive !== "boolean") {
    throw new ValidationError("활성 상태는 불린 값이어야 합니다.", "isActive");
  }
};
