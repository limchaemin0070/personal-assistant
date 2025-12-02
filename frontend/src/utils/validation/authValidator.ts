const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
    isValid: boolean;
    error?: string;
    field?: string;
}

export interface SignUpValidationData {
    email?: string;
    password?: string;
    confirmPassword?: string;
    nickname?: string;
}

// 이메일 유효성 검사
export const validateEmail = (email?: string): ValidationResult => {
    if (!email || !email.trim()) {
        return {
            isValid: false,
            error: '이메일을 입력해주세요.',
            field: 'email',
        };
    }
    if (!EMAIL_REGEX.test(email.trim())) {
        return {
            isValid: false,
            error: '올바른 이메일 형식이 아닙니다.',
            field: 'email',
        };
    }
    return { isValid: true };
};

// 인증번호 유효성 검사
export const validateCode = (code?: string): ValidationResult => {
    if (!code || !code.trim()) {
        return {
            isValid: false,
            error: '인증번호를 입력해주세요.',
            field: 'code',
        };
    }
    if (!/^\d{6}$/.test(code.trim())) {
        return {
            isValid: false,
            error: '인증번호는 6자리 숫자여야 합니다.',
            field: 'code',
        };
    }
    return { isValid: true };
};

// 비밀번호 유효성 검사
export const validatePassword = (password?: string): ValidationResult => {
    if (!password) {
        return {
            isValid: false,
            error: '비밀번호를 입력해주세요.',
            field: 'password',
        };
    }
    if (password.length < 8) {
        return {
            isValid: false,
            error: '비밀번호는 최소 8자 이상이어야 합니다.',
            field: 'password',
        };
    }
    return { isValid: true };
};

// 비밀번호 확인 유효성 검사
export const validateConfirmPassword = (
    password?: string,
    confirmPassword?: string,
): ValidationResult => {
    if (!confirmPassword) {
        return {
            isValid: false,
            error: '비밀번호 확인란을 입력해주세요.',
            field: 'confirmPassword',
        };
    }
    if (password !== confirmPassword) {
        return {
            isValid: false,
            error: '비밀번호가 일치하지 않습니다.',
            field: 'confirmPassword',
        };
    }
    return { isValid: true };
};

// 닉네임 유효성 검사
export const validateNickname = (nickname?: string): ValidationResult => {
    if (!nickname || !nickname.trim()) {
        return {
            isValid: false,
            error: '닉네임을 입력해주세요.',
            field: 'nickname',
        };
    }
    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length < 1 || trimmedNickname.length > 10) {
        return {
            isValid: false,
            error: '닉네임은 1자 이상 10자 이하여야 합니다.',
            field: 'nickname',
        };
    }
    return { isValid: true };
};

// 회원가입 전체 유효성 검사
export const validateSignUp = (
    data: SignUpValidationData,
): {
    isValid: boolean;
    errors: Record<string, string>;
} => {
    const errors: Record<string, string> = {};

    const emailResult = validateEmail(data.email);
    if (!emailResult.isValid && emailResult.error) {
        errors.email = emailResult.error;
    }

    const passwordResult = validatePassword(data.password);
    if (!passwordResult.isValid && passwordResult.error) {
        errors.password = passwordResult.error;
    }

    const confirmPasswordResult = validateConfirmPassword(
        data.password,
        data.confirmPassword,
    );
    if (!confirmPasswordResult.isValid && confirmPasswordResult.error) {
        errors.confirmPassword = confirmPasswordResult.error;
    }

    const nicknameResult = validateNickname(data.nickname);
    if (!nicknameResult.isValid && nicknameResult.error) {
        errors.nickname = nicknameResult.error;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};
