import bcrypt from "bcrypt";
import { User } from "../models/User.model";
import { EmailAlreadyExistsError } from "../errors/BusinessError";
import { InvalidCredentialsError } from "../errors/AuthError";

interface CreateUserParams {
  email: string;
  password: string;
  nickname: string;
  notification_enabled?: boolean;
}

class UserService {
  // User DB 이메일로 사용자 조회
  // User 객체가 필요할 때 사용 (로그인, 프로필 조회 등...)
  async findByEmail(email: string): Promise<User | null> {
    const user = await User.findOne({ where: { email } });
    return user;
  }

  // User DB에 유저 존재하는지 확인
  // Boolean chaek 필요할 때 사용
  async emailExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return !!user;
  }

  // User DB이메일이 존재하지 않는지 확인
  // 회원 가입 시에만 사용
  async ensureEmailNotExists(email: string): Promise<void> {
    const exists = await this.emailExists(email);
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

  // 비밀번호 검증
  async verifyPassword(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    return user;
  }
}

export const userService = new UserService();
