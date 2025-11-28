import bcrypt from "bcrypt";
import { User } from "../models/User.model";
import { EmailAlreadyExistsError } from "../errors/BusinessError";

interface CreateUserParams {
  email: string;
  password: string;
  nickname: string;
  notification_enabled?: boolean;
}

class UserService {
  // User DB에 유저 존재하는지 확인
  async checkEmailExists(email: string): Promise<boolean> {
    const user = await User.findOne({ where: { email } });
    return !!user;
  }

  // 유저 테이블에 이메일이 존재하지 않는지 확인
  async validateEmailNotExists(email: string): Promise<void> {
    const exists = await this.checkEmailExists(email);
    if (exists) {
      throw new EmailAlreadyExistsError();
    }
  }

  // 사용자 생성
  async createUser(params: CreateUserParams): Promise<User> {
    const { email, password, nickname, notification_enabled = false } = params;
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
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
