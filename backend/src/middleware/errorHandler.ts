import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/CustomErrors";
import { env } from "../config/env";

// 에러 처리 미들웨어

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 개발 환경에서는 상세 에러 로그 출력
  if (env.NODE_ENV === "development") {
    console.error("=== 에러 발생 ===");
    console.error("URL:", req.method, req.originalUrl);
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    console.error("=================");
  }

  if (error instanceof CustomError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.field && { field: error.field }),
      },
    });
  }

  // 예상치 못한 에러인 경우
  console.error("예상치 못한 에러:", error);

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "서버 오류가 발생했습니다.",
      ...(env.NODE_ENV === "development" && {
        details: error.message,
      }),
    },
  });
};
