import { ZodError, ZodIssue } from "zod";
import { ValidationError } from "../../errors/ValidationError";

/**
 * 첫번째 에러 ValidationError로 변환하여 throw
 */
export function handleZodError(error: ZodError): never {
  if (error.issues.length === 0) {
    throw new ValidationError("입력값 검증에 실패했습니다.");
  }

  const firstIssue = error.issues[0];
  if (!firstIssue) {
    throw new ValidationError("입력값 검증에 실패했습니다.");
  }

  const field = firstIssue.path.join(".") || undefined;
  const message = firstIssue.message;

  throw new ValidationError(message, field);
}

export function validateWithZod<T>(
  schema: { parse: (data: unknown) => T },
  data: unknown
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      handleZodError(error);
    }
    throw error;
  }
}

/**
 * 에러 발생하면 ValidationError를 throw
 */
export function safeParseWithZod<T>(
  schema: {
    safeParse: (data: unknown) => {
      success: boolean;
      data?: T;
      error?: ZodError;
    };
  },
  data: unknown
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    if (result.error) {
      handleZodError(result.error);
    } else {
      throw new ValidationError("입력값 검증에 실패했습니다.");
    }
  }
  if (!result.data) {
    throw new ValidationError("입력값 검증에 실패했습니다.");
  }
  return result.data;
}
