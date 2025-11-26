import { env } from "../config/env";
import { emailTransporter } from "../config/email";
import nodemailer from "nodemailer";

function createVerificationEmailTemplate(code: string): string {
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">이메일 인증 코드</h2>
        <p>이메일 인증 코드:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">
            ${code}
          </h1>
        </div>
        <p>해당 코드는 10분간 유효합니다.</p>
      </div>
    `;
}

export async function sendEmail(
  to: string,
  verificationCode: string
): Promise<void> {
  const mailTemplate: nodemailer.SendMailOptions = {
    from: env.EMAIL_FROM,
    to: to,
    subject: "이메일 인증 코드",
    html: createVerificationEmailTemplate(verificationCode),
  };

  try {
    const info = await emailTransporter.sendMail(mailTemplate);
    console.log("이메일 발송 성공:", info.messageId);
  } catch (error) {
    if (error instanceof Error) {
      console.error("이메일 발송 실패:", error.message);
      throw new Error(`이메일 발송 중 오류가 발생했습니다: ${error.message}`);
    }
    throw new Error("알 수 없는 오류가 발생했습니다.");
  }
}
