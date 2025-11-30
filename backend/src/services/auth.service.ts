import bcrypt from "bcrypt";
import { InvalidCredentialsError } from "../errors/AuthError";
import { User } from "../models/User.model";
import { userService } from "./user.service";
import { emailService } from "./email.service";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from "../utils/authentication/jwt";

interface SignUpParams {
  email: string;
  password: string;
  nickname: string;
  notification_enabled?: boolean;
}

interface SignUpResult {
  user: User;
}

interface LoginResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  // 회원가입
  async signUp(params: SignUpParams): Promise<SignUpResult> {
    const { email, password, nickname, notification_enabled = false } = params;

    await userService.ensureEmailNotExists(email);
    await emailService.isEmailVerified(email);

    const user = await userService.createUser({
      email,
      password,
      nickname,
      notification_enabled,
    });

    await emailService.cleanupVerification(email);

    return { user };
  }

  // 비밀번호 검증
  private async verifyPassword(email: string, password: string): Promise<User> {
    const user = await userService.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    return user;
  }

  // 로그인
  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.verifyPassword(email, password);
    const tokens = this.generateTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  // 토큰 생성하는 함수
  private generateTokens(user: User) {
    const payload: TokenPayload = {
      userId: user.user_id,
      email: user.email,
    };

    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }

  // 리프레시토큰을 이용해 액세스토큰 재발급
  async refreshTokens(refreshToken: string): Promise<RefreshTokenResult> {
    const payload = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}

export const authService = new AuthService();
