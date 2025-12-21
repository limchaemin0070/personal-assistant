import { z } from "zod";
import { ValidationError } from "../../errors/ValidationError";
import { validateWithZod } from "./zodErrorHandler";

// 날짜 형식 검증 (YYYY-MM-DD)
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// 시간 형식 검증 (HH:MM:SS 또는 HH:MM)
const TIME_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:([0-5][0-9]))?$/;

// 날짜 문자열 검증
const dateStringSchema = z
  .string()
  .regex(DATE_REGEX, "날짜는 YYYY-MM-DD 형식이어야 합니다.")
  .refine(
    (date) => {
      const dateObj = new Date(date);
      return !isNaN(dateObj.getTime());
    },
    {
      message: "날짜가 유효하지 않습니다.",
    }
  )
  .nullable()
  .optional();

// 시간 문자열 검증
const timeStringSchema = z
  .string()
  .regex(TIME_REGEX, "시간은 HH:MM 또는 HH:MM:SS 형식이어야 합니다.")
  .nullable()
  .optional();

// Reminder 생성 스키마
const createReminderSchema = z
  .object({
    title: z
      .string()
      .min(1, "제목을 입력해주세요.")
      .max(255, "제목은 255자 이하여야 합니다."),
    memo: z
      .string()
      .max(500, "메모는 500자 이하여야 합니다.")
      .nullable()
      .optional(),
    date: dateStringSchema,
    time: timeStringSchema,
    is_all_day: z.boolean().optional(),
    notification_enabled: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // 종일 일정이 아닌 경우 시간 필수
      if (data.is_all_day === false) {
        return !!data.time;
      }
      return true;
    },
    {
      message: "종일 일정이 아닌 경우 시간을 입력해주세요.",
      path: ["time"],
    }
  );

// Reminder 업데이트 스키마
const updateReminderSchema = z
  .object({
    title: z
      .string()
      .min(1, "제목을 입력해주세요.")
      .max(255, "제목은 255자 이하여야 합니다.")
      .optional(),
    memo: z
      .string()
      .max(500, "메모는 500자 이하여야 합니다.")
      .nullable()
      .optional(),
    date: dateStringSchema,
    time: timeStringSchema,
    is_all_day: z.boolean().optional(),
    is_completed: z.boolean().optional(),
    notification_enabled: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // 종일 일정이 아닌 경우 시간 필수
      if (data.is_all_day === false) {
        return !!data.time;
      }
      return true;
    },
    {
      message: "종일 일정이 아닌 경우 시간을 입력해주세요.",
      path: ["time"],
    }
  );

// Reminder 완료 상태 업데이트 스키마
const updateReminderCompleteSchema = z.object({
  isCompleted: z.boolean("완료 상태는 불린 값이어야 합니다."),
});

// 타입 정의
export type CreateReminderPayload = z.infer<typeof createReminderSchema>;
export type UpdateReminderPayload = z.infer<typeof updateReminderSchema>;
export type UpdateReminderCompletePayload = z.infer<
  typeof updateReminderCompleteSchema
>;

export const validateCreateReminderPayload = (payload: unknown) => {
  validateWithZod(createReminderSchema, payload);
};

export const validateUpdateReminderPayload = (payload: unknown) => {
  validateWithZod(updateReminderSchema, payload);
};

export const validateUpdateReminderCompletePayload = (payload: unknown) => {
  validateWithZod(updateReminderCompleteSchema, payload);
};
