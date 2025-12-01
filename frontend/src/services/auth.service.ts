import { defaultApi } from '@/utils/api';
import type { ApiSuccessResponse } from '@/utils/api';

export interface SendVerificationCodeRequest {
    email: string;
}

export interface SendVerificationCodeResponse {
    email: string;
    expires_at: string;
}

export interface VerifyCodeRequest {
    email: string;
    code: string;
}

export interface VerifyCodeResponse {
    email: string;
}

export interface SignUpRequest {
    email: string;
    password: string;
    nickname: string;
    notification_enabled?: boolean;
}

export interface SignUpResponse {
    email: string;
    nickname: string;
}

// export interface LoginRequest {
//     email: string;
//     password: string;
// }

// export interface LoginResponse {
//     email: string;
//     nickname: string;
// }

export const authService = {
    // 이메일 인증 코드 발송
    async sendVerificationCode(
        email: string,
    ): Promise<ApiSuccessResponse<SendVerificationCodeResponse>> {
        const response = await defaultApi<SendVerificationCodeResponse>(
            '/auth/email-verifications',
            {
                method: 'POST',
                data: { email },
            },
        );
        return response.data;
    },

    // 이메일 인증 코드 검증
    async verifyCode(
        email: string,
        code: string,
    ): Promise<ApiSuccessResponse<VerifyCodeResponse>> {
        const response = await defaultApi<VerifyCodeResponse>(
            '/auth/email-verifications/verify',
            {
                method: 'POST',
                data: { email, code },
            },
        );
        return response.data;
    },

    // 회원가입
    async register(
        email: string,
        password: string,
        nickname: string,
    ): Promise<ApiSuccessResponse<VerifyCodeResponse>> {
        const response = await defaultApi<VerifyCodeResponse>('/auth/sign-up', {
            method: 'POST',
            data: { email, password, nickname },
        });
        return response.data;
    },
};
