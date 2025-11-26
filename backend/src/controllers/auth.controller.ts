import { Request, Response } from "express";
import { emailService } from "../services/email.service";

export const sendVerificationCode = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "이메일 주소가 누락되었습니다.",
          field: "email",
        },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_EMAIL_FORMAT",
          message: "올바른 이메일 형식이 아닙니다.",
          field: "email",
        },
      });
    }

    const result = await emailService.sendVerificationCode(email);

    return res.status(200).json({
      success: true,
      message: "인증 코드가 발송되었습니다.",
      data: {
        email: result.email,
        expiresAt: result.expiresAt,
      },
    });
  } catch (error: any) {
    // TODO : 에러 타입 지정 및 핸들러 추가
    // 임시로 any 타입 지정
    console.error("인증 코드 발송 실패:", error);
    if (error.code && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.field && { field: error.field }),
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "서버 오류가 발생했습니다.",
      },
    });
  }
};
