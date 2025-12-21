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
  .min(1, "날짜를 입력해주세요.")
  .regex(DATE_REGEX, "날짜는 YYYY-MM-DD 형식이어야 합니다.")
  .refine(
    (date) => {
      const dateObj = new Date(date);
      return !isNaN(dateObj.getTime());
    },
    {
      message: "날짜가 유효하지 않습니다.",
    }
  );

// 시간 문자열 검증
const timeStringSchema = z
  .string()
  .regex(TIME_REGEX, "시간은 HH:MM 또는 HH:MM:SS 형식이어야 합니다.");

// Schedule 생성 스키마
const createScheduleSchema = z
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
    start_date: dateStringSchema,
    end_date: dateStringSchema,
    start_time: timeStringSchema.nullable().optional(),
    end_time: timeStringSchema.nullable().optional(),
    is_all_day: z.boolean().optional(),
    notification_enabled: z.boolean().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      return end >= start;
    },
    {
      message: "종료 날짜는 시작 날짜보다 이후여야 합니다.",
      path: ["end_date"],
    }
  )
  .refine(
    (data) => {
      if (data.is_all_day === false) {
        return !!data.start_time && !!data.end_time;
      }
      return true;
    },
    {
      message: "종일 일정이 아닌 경우 시작 시간을 입력해주세요.",
      path: ["start_time"],
    }
  )
  .refine(
    (data) => {
      if (data.is_all_day === false) {
        return !!data.start_time && !!data.end_time;
      }
      return true;
    },
    {
      message: "종일 일정이 아닌 경우 종료 시간을 입력해주세요.",
      path: ["end_time"],
    }
  );

// Schedule 업데이트 스키마 (모든 필드가 optional)
const updateScheduleSchema = z
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
    start_date: dateStringSchema.optional(),
    end_date: dateStringSchema.optional(),
    start_time: timeStringSchema.nullable().optional(),
    end_time: timeStringSchema.nullable().optional(),
    is_all_day: z.boolean().optional(),
    notification_enabled: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        return end >= start;
      }
      return true;
    },
    {
      message: "종료 날짜는 시작 날짜보다 이후여야 합니다.",
      path: ["end_date"],
    }
  )
  .refine(
    (data) => {
      if (data.is_all_day === false) {
        return !!data.start_time && !!data.end_time;
      }
      return true;
    },
    {
      message: "종일 일정이 아닌 경우 시작 시간을 입력해주세요.",
      path: ["start_time"],
    }
  )
  .refine(
    (data) => {
      if (data.is_all_day === false) {
        return !!data.start_time && !!data.end_time;
      }
      return true;
    },
    {
      message: "종일 일정이 아닌 경우 종료 시간을 입력해주세요.",
      path: ["end_time"],
    }
  );

// 날짜 범위 쿼리 스키마
const dateRangeQuerySchema = z
  .object({
    startDate: dateStringSchema,
    endDate: dateStringSchema,
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start < end;
    },
    {
      message: "startDate는 endDate보다 이전이어야 합니다.",
      path: ["startDate"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
      const rangeInMs = end.getTime() - start.getTime();
      return rangeInMs <= oneYearInMs;
    },
    {
      message: "조회 범위는 최대 1년을 초과할 수 없습니다.",
      path: ["dateRange"],
    }
  );

// limit 파라미터 스키마
const limitSchema = z
  .string()
  .refine(
    (val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 1;
    },
    {
      message: "limit는 1 이상의 숫자여야 합니다.",
    }
  )
  .refine(
    (val) => {
      const num = parseInt(val, 10);
      return num <= 1000;
    },
    {
      message: "limit는 최대 1000까지 가능합니다.",
    }
  );

// 타입 정의
export type CreateSchedulePayload = z.infer<typeof createScheduleSchema>;
export type UpdateSchedulePayload = z.infer<typeof updateScheduleSchema>;

// export const validateCreateSchedulePayload = (payload: unknown) => {
//   validateWithZod(createScheduleSchema, payload);
// };

// export const validateUpdateSchedulePayload = (payload: unknown) => {
//   validateWithZod(updateScheduleSchema, payload);
// };

// export const validateDateRangeQueryOrThrow = (
//   startDate?: string,
//   endDate?: string
// ) => {
//   if (!startDate) {
//     throw new ValidationError("startDate 파라미터가 필요합니다.", "startDate");
//   }
//   if (!endDate) {
//     throw new ValidationError("endDate 파라미터가 필요합니다.", "endDate");
//   }

//   validateWithZod(dateRangeQuerySchema, { startDate, endDate });
// };

// export const validateLimitOrThrow = (limit?: string) => {
//   if (limit !== undefined) {
//     validateWithZod(limitSchema, limit);
//   }
// };
