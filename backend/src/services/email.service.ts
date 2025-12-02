import { Op } from "sequelize";
import { EmailVerification } from "../models/EmailVerification.model";
import { generateVerificationCode } from "../utils/codeGenerator";
import { sendEmail } from "../utils/emailSender";
import { userService } from "./user.service";
import {
  InvalidVerificationCodeError,
  VerificationCodeExpiredError,
} from "../errors/BusinessError";
import { ValidationError } from "../errors/ValidationError";

interface SendVerificationCodeResult {
  email: string;
  expires_at: Date;
  message: string;
}

interface verifyCodeResult {
  email: string;
  message: string;
}

interface isEmailVerifiedResult {
  email: string;
  message: string;
}

// 이메일 인증 코드도 만료기한을 가지고 (10분)
// 이메일의 인증 상태 또한 만료기한을 가짐 (30분)

class EmailService {
  async sendVerificationCode(
    email: string
  ): Promise<SendVerificationCodeResult> {
    // 이메일 중복 체크
    await userService.ensureEmailNotExists(email);
    // 기존 인증 코드가 있으면 삭제 (중복 방지)
    await EmailVerification.destroy({
      where: { email },
    });

    const code = generateVerificationCode();
    // 만료 시간 : 10분
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);

    // 데이터베이스에 이메일과 코드를 저장
    await EmailVerification.create({
      email,
      code,
      expires_at,
      is_verified: false,
    });

    // 이메일 발송
    await sendEmail(email, code);

    return {
      email,
      expires_at,
      message: "인증 코드가 발송되었습니다",
    };
  }

  async verifyCode(email: string, code: string): Promise<verifyCodeResult> {
    // 1 - 인증 코드 발송 여부 확인
    const verification = await EmailVerification.findOne({
      where: { email },
    });

    // 인증 관리 DB에 이메일이 없음
    if (!verification) {
      throw new ValidationError("인증 정보가 없습니다.", "email");
    }

    // 2 - 만료 시간 확인
    if (new Date() > verification.expires_at) {
      await verification.destroy();
      throw new VerificationCodeExpiredError();
    }

    // 3 - 코드 일치 여부 확인
    if (verification.code !== code) {
      throw new InvalidVerificationCodeError();
    }

    // 검증 성공 -> is_verified를 true로 업데이트
    await verification.update({ is_verified: true });
    return {
      email,
      message: "이메일 인증이 완료되었습니다.",
    };
  }

  // 이메일 인증 여부 체크
  async isEmailVerified(email: string): Promise<isEmailVerifiedResult> {
    // 1 - 인증 코드 발송 여부 확인
    const verification = await EmailVerification.findOne({
      where: { email, is_verified: true },
    });

    // 인증 관리 DB에 이메일이 없슴
    if (!verification) {
      throw new ValidationError("인증 정보가 없습니다.", "email");
    }

    // 인증 완료 후 30분 이내인지 확인
    const verifiedAt = verification.updated_at || verification.created_at;
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    // 만료되었을 경우 인증 정보 삭제
    if (verifiedAt < thirtyMinutesAgo) {
      await verification.destroy();
      throw new VerificationCodeExpiredError();
    }

    return {
      email,
      message: "인증 완료된 이메일입니다.",
    };
  }

  // 특정 이메일의 인증 정보를 선택 정리
  async cleanupVerification(email: string): Promise<void> {
    await EmailVerification.destroy({
      where: { email },
    });
  }

  // 만료된 인증 정보를 주기적으로 정리하는 스케줄러
  async cleanupExpiredVerifications(): Promise<number> {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const deletedCount = await EmailVerification.destroy({
      where: {
        [Op.or]: [
          { expires_at: { [Op.lt]: now } },
          {
            is_verified: true,
            updated_at: { [Op.lt]: thirtyMinutesAgo },
          },
        ],
      },
    });
    return deletedCount;
  }
}

export const emailService = new EmailService();
