import { Request, Response } from "express";
import { emailService } from "../services/email.service";
import { userService } from "../services/user.service";
import { EmailVerification } from "../models/EmailVerification.model";

// 이메일 검증 코드 전송
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
        expires_at: result.expires_at,
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

export const verifyCode = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, code } = req.body;

    // 이메일 필수 체크
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

    // 이메일 형식 체크
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

    // 인증 코드 존재 여부 체크
    if (!code) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "인증 코드가 누락되었습니다.",
          field: "code",
        },
      });
    }

    // 인증 코드 형식 체크 (6자리 숫자)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_CODE_FORMAT",
          message: "인증 코드는 6자리 숫자여야 합니다.",
          field: "code",
        },
      });
    }

    const result = await emailService.verifyCode(email, code);

    if (!result) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VERIFICATION_FAILED",
          message:
            "인증에 실패했습니다. 인증 코드가 올바르지 않거나 만료되었습니다.",
        },
      });
    }

    return res.status(200).json({
      success: result,
      message: "이메일 인증이 완료되었습니다.",
    });
  } catch (error: any) {
    console.error("이메일 인증 실패:", error);
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

// 회원가입
export const signUp = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, password, nickname, notification_enabled } = req.body;

    // 이메일 필수 체크
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

    // 이메일 형식 체크
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

    // 비밀번호 필수 체크
    if (!password) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "비밀번호가 누락되었습니다.",
          field: "password",
        },
      });
    }

    // 비밀번호 길이 체크 (최소 8자)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PASSWORD_LENGTH",
          message: "비밀번호는 최소 8자 이상이어야 합니다.",
          field: "password",
        },
      });
    }

    // 닉네임 필수 체크
    if (!nickname) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "닉네임이 누락되었습니다.",
          field: "nickname",
        },
      });
    }

    // 닉네임 길이 체크 (1-10자)
    if (nickname.length < 1 || nickname.length > 10) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_NICKNAME_LENGTH",
          message: "닉네임은 1자 이상 10자 이하여야 합니다.",
          field: "nickname",
        },
      });
    }

    // 이메일 인증 완료 여부 확인
    const isVerified = await emailService.isEmailVerified(email);
    if (!isVerified) {
      return res.status(400).json({
        success: false,
        error: {
          code: "EMAIL_NOT_VERIFIED",
          message:
            "이메일 인증이 완료되지 않았습니다. 먼저 이메일 인증을 완료해주세요.",
          field: "email",
        },
      });
    }

    // 이메일 중복 체크 (추가 안전장치)
    await userService.validateEmailNotExists(email);

    // 사용자 생성
    const user = await userService.createUser({
      email,
      password,
      nickname,
      notification_enabled: notification_enabled ?? false,
    });

    // 인증 레코드 정리 (회원가입 완료 후 삭제)
    await EmailVerification.destroy({
      where: { email },
    });

    return res.status(201).json({
      success: true,
      message: "회원가입이 완료되었습니다.",
      data: {
        user_id: user.user_id,
        email: user.email,
        nickname: user.nickname,
        notification_enabled: user.notification_enabled,
      },
    });
  } catch (error: any) {
    console.error("회원가입 실패:", error);
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
