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
  /**
   * 회원가입 시 기입한 이메일에 인증번호 전송
   * @param email
   * @returns
   */
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
   * 이메일 인증번호가 DB와 일치하는지 검증
   * @param email
   * @param code
   * @returns
   */
  async verifyCode(email: string, code: string): Promise<boolean> {
    const verification = await EmailVerification.findOne({
      where: { email, code },
    });

    // 검증 실패 : 값이 없음
    if (!verification) {
      return false;
    }

    // 검증 실패 : 코드 시간 만료됨
    if (new Date() > verification.expiresAt) {
      await verification.destroy();
      return false;
    }

    // 검증 실패: 코드가 일치하지 않음
    if (verification.code !== code) {
      return false;
    }

    // 검증 성공 -> DB 삭제
    await verification.destroy();
    return true;
  }
}

export const emailService = new EmailService();
