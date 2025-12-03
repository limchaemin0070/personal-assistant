export const AUTH_INPUT_VALIDATION = {
    // 이메일 형식 검증: @와 .을 포함한 기본 이메일 형식
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    // 인증번호 형식 검증: 6자리 숫자
    CODE_REGEX: /^\d{6}$/,

    // 비밀번호 최소 길이
    PASSWORD_MIN_LENGTH: 8,

    // 닉네임 길이 제한
    NICKNAME_MIN_LENGTH: 1,
    NICKNAME_MAX_LENGTH: 10,

    // 이메일 최대 길이 (DB 제약조건)
    EMAIL_MAX_LENGTH: 50,
} as const;
