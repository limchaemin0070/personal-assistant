/**
 * 인증 관련 타입 정의
 */

/**
 * 이메일 인증 코드 발송 요청
 */
export interface SendVerificationCodeRequest {
    email: string;
}

/**
 * 이메일 인증 코드 발송 응답
 */
export interface SendVerificationCodeResponse {
    email: string;
    expires_at: string;
}

/**
 * 이메일 인증 코드 검증 요청
 */
export interface VerifyCodeRequest {
    email: string;
    code: string;
}

/**
 * 이메일 인증 코드 검증 응답
 */
export interface VerifyCodeResponse {
    email: string;
}

/**
 * 회원가입 요청
 */
export interface SignUpRequest {
    email: string;
    password: string;
    nickname: string;
    notification_enabled?: boolean;
}

/**
 * 회원가입 응답
 */
export interface SignUpResponse {
    email: string;
    nickname: string;
}

/**
 * 로그인 요청
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * 로그인 응답
 */
export interface LoginResponse {
    email: string;
    nickname: string;
}
