import { EmailVerification } from "../models/EmailVerification.model";
import { generateVerificationCode } from "../utils/codeGenerator";
import { sendEmail } from "../utils/emailSender";
import { userService } from "./user.service";

interface SendVerificationCodeResult {
  email: string;
  expiresAt: Date;
  message?: string;
}

// TODO : Redis

class EmailService {
  async sendVerificationCode(
    email: string
  ): Promise<SendVerificationCodeResult> {
    // 이메일 중복 체크 로직
    await userService.validateEmailNotExists(email);

    // 기존 인증 코드가 있으면 삭제 (중복 방지)
    await EmailVerification.destroy({
      where: { email },
    });

    // 인증 코드 생성
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 만료 시간 : 10분

    // 데이터베이스 저장
    await EmailVerification.create({
      email,
      code,
      expiresAt,
    });

    // 이메일 발송
    await sendEmail(email, code);

    return {
      email,
      expiresAt,
      message: "인증 코드가 발송되었습니다",
    };
  }

  /**
   * 인증 코드 검증
   */
  //   async verifyCode(email: string, code: string): Promise<boolean> {
  //     const verification = await EmailVerification.findOne({
  //       where: { email, code },
  //     });

  //     if (!verification) {
  //       return false;
  //     }

  //     // 만료 시간 확인
  //     if (new Date() > verification.expiresAt) {
  //       await verification.destroy();
  //       return false;
  //     }

  //     // 인증 성공 시 삭제
  //     await verification.destroy();
  //     return true;
  //   }
}

export const emailService = new EmailService();
