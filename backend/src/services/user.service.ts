import bcrypt from "bcrypt";
import { User } from "../models/User.model";

interface CreateUserParams {
  email: string;
  password: string;
  nickname: string;
  notification_enabled?: boolean;
}

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

  /**
   * 사용자 생성
   */
  async createUser(params: CreateUserParams): Promise<User> {
    const { email, password, nickname, notification_enabled = false } = params;

    // 비밀번호 해싱
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 사용자 생성
    const user = await User.create({
      email,
      password_hash,
      nickname,
      notification_enabled,
    });

    return user;
  }
}

export const userService = new UserService();
