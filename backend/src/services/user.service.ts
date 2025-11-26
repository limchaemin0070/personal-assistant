import { User } from "../models/User.model";

class UserService {
  /**
   * 이메일 존재 여부 확인
   */
  async checkEmailExists(email: string): Promise<boolean> {
    const user = await User.findOne({ where: { email } });
    return !!user;
  }

  /**
   * 이메일 중복 체크 (예외 발생)
   */
  async validateEmailNotExists(email: string): Promise<void> {
    const exists = await this.checkEmailExists(email);
    if (exists) {
      const error: any = new Error("이미 사용 중인 이메일입니다.");
      error.statusCode = 409;
      error.code = "EMAIL_ALREADY_EXISTS";
      error.field = "email";
      throw error;
    }
  }
}

export const userService = new UserService();
