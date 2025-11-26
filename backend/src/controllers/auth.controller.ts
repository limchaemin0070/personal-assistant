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
        message: "이메일 주소가 누락되었습니다.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "유효한 이메일 형식이 아닙니다.",
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
  } catch (error) {
    console.error("인증 코드 발송 실패:", error);
    return res.status(500).json({
      success: false,
      message: "인증 코드 발송 중 오류가 발생했습니다.",
    });
  }
};
