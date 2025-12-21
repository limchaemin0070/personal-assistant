import { z } from "zod";
import { ValidationError } from "../../errors/ValidationError";
import { validateWithZod } from "./zodErrorHandler";

// 시간 형식 검증 (HH:MM:SS 또는 HH:MM)
const TIME_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:([0-5][0-9]))?$/;

// 날짜 형식 검증 (YYYY-MM-DD)
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// 시간 문자열 검증
const timeStringSchema = z
  .string()
  .min(1, "시간을 입력해주세요.")
  .regex(TIME_REGEX, "시간은 HH:MM 또는 HH:MM:SS 형식이어야 합니다.");

// 날짜 문자열 검증
const dateStringSchemaBase = z
  .string()
  .regex(DATE_REGEX, "날짜는 YYYY-MM-DD 형식이어야 합니다.");

// 반복 요일 배열 검증
const repeatDaysSchema = z
  .array(z.number().int().min(0).max(6))
  .min(1, "반복 요일은 최소 1개 이상이어야 합니다.")
  .max(7, "반복 요일은 최대 7개까지 가능합니다.")
  .refine(
    (days) => {
      const uniqueDays = new Set(days);
      return uniqueDays.size === days.length;
    },
    {
      message: "반복 요일에 중복된 값이 있습니다.",
    }
  );

// Alarm 생성 스키마
const createAlarmSchema = z
  .object({
    title: z
      .string()
      .max(255, "알람 제목은 최대 255자까지 가능합니다.")
      .nullable()
      .optional()
      .or(z.literal("")),
    date: dateStringSchemaBase.nullable().optional(),
    time: timeStringSchema,
    is_repeat: z.boolean().optional(),
    repeat_days: repeatDaysSchema.nullable().optional(),
    is_active: z.boolean().optional(),
    alarm_type: z.enum(["repeat", "once"], {
      message: "알람 타입은 'repeat' 또는 'once'여야 합니다.",
    }),
  })
  .refine(
    (data) => {
      // 반복 알람인 경우 repeat_days 필수
      if (data.is_repeat === true) {
        return !!data.repeat_days && data.repeat_days.length > 0;
      }
      return true;
    },
    {
      message: "반복 알람인 경우 반복 요일을 입력해주세요.",
      path: ["repeat_days"],
    }
  )
  .refine(
    (data) => {
      // 반복 알람이 아닌 경우 repeat_days는 null이어야 함
      if (data.is_repeat === false) {
        return data.repeat_days === null || data.repeat_days === undefined;
      }
      return true;
    },
    {
      message: "반복 알람이 아닌 경우 반복 요일을 입력할 수 없습니다.",
      path: ["repeat_days"],
    }
  );

// Alarm 업데이트 스키마
const updateAlarmSchema = z
  .object({
    title: z
      .string()
      .max(255, "알람 제목은 최대 255자까지 가능합니다.")
      .nullable()
      .optional()
      .or(z.literal("")),
    date: dateStringSchemaBase.nullable().optional(),
    time: timeStringSchema.optional(),
    is_repeat: z.boolean().optional(),
    repeat_days: repeatDaysSchema.nullable().optional(),
    is_active: z.boolean().optional(),
    alarm_type: z.enum(["repeat", "once"]).optional(),
  })
  .refine(
    (data) => {
      // is_repeat가 true로 설정된 경우 repeat_days 필수
      if (data.is_repeat === true) {
        return !!data.repeat_days && data.repeat_days.length > 0;
      }
      return true;
    },
    {
      message: "반복 알람인 경우 반복 요일을 입력해주세요.",
      path: ["repeat_days"],
    }
  )
  .refine(
    (data) => {
      // is_repeat가 false로 설정된 경우 repeat_days는 null이어야 함
      if (data.is_repeat === false) {
        return data.repeat_days === null || data.repeat_days === undefined;
      }
      return true;
    },
    {
      message: "반복 알람이 아닌 경우 반복 요일을 입력할 수 없습니다.",
      path: ["repeat_days"],
    }
  );

// Alarm 활성 상태 업데이트 스키마
const updateAlarmActiveSchema = z.object({
  isActive: z.boolean("활성 상태는 불린 값이어야 합니다."),
});

export type CreateAlarmPayload = z.infer<typeof createAlarmSchema>;
export type UpdateAlarmPayload = z.infer<typeof updateAlarmSchema>;
export type UpdateAlarmActivePayload = z.infer<typeof updateAlarmActiveSchema>;

// export const validateCreateAlarmPayload = (payload: unknown) => {
//   validateWithZod(createAlarmSchema, payload);
// };

// export const validateUpdateAlarmPayload = (payload: unknown) => {
//   validateWithZod(updateAlarmSchema, payload);
// };

// export const validateUpdateAlarmActivePayload = (payload: unknown) => {
//   validateWithZod(updateAlarmActiveSchema, payload);
// };
