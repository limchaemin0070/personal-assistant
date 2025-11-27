import { Op } from "sequelize";
import { EmailVerification } from "../models/EmailVerification.model";
import { generateVerificationCode } from "../utils/codeGenerator";
import { sendEmail } from "../utils/emailSender";
import { userService } from "./user.service";

interface SendVerificationCodeResult {
  email: string;
  expires_at: Date;
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
    const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 만료 시간 : 10분

    // 데이터베이스 저장
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
    if (new Date() > verification.expires_at) {
      await verification.destroy();
      return false;
    }

    // 검증 실패: 코드가 일치하지 않음
    if (verification.code !== code) {
      return false;
    }

    // 검증 성공 -> is_verified를 true로 업데이트 (삭제하지 않음)
    // 회원가입 완료 시까지 상태 유지 (30분 후 자동 정리)
    await verification.update({ is_verified: true });
    return true;
  }

  /**
   * 이메일 인증 완료 여부 확인
   * @param email
   * @returns 인증 완료 여부
   */
  async isEmailVerified(email: string): Promise<boolean> {
    const verification = await EmailVerification.findOne({
      where: { email, is_verified: true },
    });

    if (!verification) {
      return false;
    }

    // 인증 완료 후 30분 이내인지 확인
    const verifiedAt = verification.updated_at || verification.created_at;
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    if (verifiedAt < thirtyMinutesAgo) {
      // 만료된 인증 레코드 삭제
      await verification.destroy();
      return false;
    }

    return true;
  }

  /**
   * 만료된 인증 레코드 정리 (우선은 스케줄러에서 주기적으로 실행)
   * @returns 삭제된 레코드 수
   */
  async cleanupExpiredVerifications(): Promise<number> {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    const deletedCount = await EmailVerification.destroy({
      where: {
        [Op.or]: [
          // 만료된 인증 코드
          { expires_at: { [Op.lt]: now } },
          // 인증 완료 후 30분 경과한 레코드
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
