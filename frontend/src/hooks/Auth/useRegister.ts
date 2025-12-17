// 📁 hooks/useRegister.ts
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { authService } from '@/services/auth.service';
import { useToastStore } from '@/hooks/useToastStore';
import type { ApiErrorResponse } from '@/types/api';
import { extractErrorMessage } from '@/utils/errorHandler';
import {
    validateCode,
    validateConfirmPassword,
    validateEmail,
    validateSignUp,
} from '@/utils/validation/authValidator';

interface SendVerificationCodeRequest {
    email: string;
}

interface VerifyCodeRequest {
    email: string;
    code: string;
}

interface RegisterRequest {
    email: string;
    password: string;
    nickname: string;
}

const REGISTER_ERROR_MESSAGES: Record<string, string> = {
    VALIDATION_ERROR: '올바르지 않은 입력 형식입니다.',
    EMAIL_ALREADY_EXISTS: '이미 사용 중인 이메일입니다.',
    INVALID_VERIFICATION_CODE: '인증번호가 올바르지 않습니다.',
    VERIFICATION_CODE_EXPIRED: '인증번호가 만료되었습니다.',
    EMAIL_NOT_VERIFIED: '이메일 인증을 완료해주세요.',
    INTERNAL_SERVER_ERROR: '서버 오류가 발생했습니다.',
    EMAIL_SERVICE_UNAVAILABLE: '이메일 인증번호 발송 서버 오류입니다.',
};

const getRegisterErrorMessage = (
    error: AxiosError<ApiErrorResponse>,
): string => {
    const errorCode = error.response?.data?.error?.code;

    if (errorCode && REGISTER_ERROR_MESSAGES[errorCode]) {
        return REGISTER_ERROR_MESSAGES[errorCode];
    }

    return extractErrorMessage(error);
};

const getVerificationErrorMessage = (
    error: AxiosError<ApiErrorResponse>,
): string => {
    const errorCode = error.response?.data?.error?.code;

    if (errorCode && REGISTER_ERROR_MESSAGES[errorCode]) {
        return REGISTER_ERROR_MESSAGES[errorCode];
    }

    return extractErrorMessage(error);
};

// 이메일 인증 코드 발송 mutation
export const useSendVerificationCode = () => {
    const { addToast } = useToastStore();

    return useMutation<
        Awaited<ReturnType<typeof authService.sendVerificationCode>>,
        AxiosError<ApiErrorResponse>,
        SendVerificationCodeRequest
    >({
        mutationFn: ({ email }: SendVerificationCodeRequest) =>
            authService.sendVerificationCode(email),

        onSuccess: () => {
            addToast('인증번호가 전송되었습니다.', 'success');
        },

        onError: (error: AxiosError<ApiErrorResponse>) => {
            const message = getVerificationErrorMessage(error);
            addToast(message, 'error');
        },
    });
};

// 이메일 인증 코드 검증 mutation
export const useVerifyCode = () => {
    const { addToast } = useToastStore();

    return useMutation<
        Awaited<ReturnType<typeof authService.verifyCode>>,
        AxiosError<ApiErrorResponse>,
        VerifyCodeRequest
    >({
        mutationFn: ({ email, code }: VerifyCodeRequest) =>
            authService.verifyCode(email, code),

        onSuccess: () => {
            addToast('이메일 인증이 완료되었습니다.', 'success');
        },

        onError: (error: AxiosError<ApiErrorResponse>) => {
            const message = getVerificationErrorMessage(error);
            addToast(message, 'error');
        },
    });
};

// 회원가입 mutation
export const useRegister = () => {
    const navigate = useNavigate();
    const { addToast } = useToastStore();

    return useMutation<
        Awaited<ReturnType<typeof authService.register>>,
        AxiosError<ApiErrorResponse>,
        RegisterRequest
    >({
        mutationFn: ({ email, password, nickname }: RegisterRequest) =>
            authService.register(email, password, nickname),

        onSuccess: () => {
            addToast('회원가입이 완료되었습니다.', 'success');
            navigate('/login');
        },

        onError: (error: AxiosError<ApiErrorResponse>) => {
            const message = getRegisterErrorMessage(error);
            addToast(message, 'error');
        },
    });
};

// 회원가입 폼 상태 관리 및 핸들러 로직
export const useRegisterForm = () => {
    const { addToast } = useToastStore();

    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nickname, setNickname] = useState('');

    const [isVerificationCodeSent, setIsVerificationCodeSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const sendVerificationCodeMutation = useSendVerificationCode();
    const verifyCodeMutation = useVerifyCode();
    const registerMutation = useRegister();

    // 필드 블러 핸들러
    const handleFieldBlur = (
        fieldName: string,
        value: string,
        validator: (value: string) => { isValid: boolean; error?: string },
    ) => {
        const result = validator(value);
        if (!result.isValid && result.error) {
            setErrors((prev) => ({
                ...prev,
                [fieldName]: result.error || '',
            }));
        } else {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    const setFieldError = (fieldName: string, error: string) => {
        setErrors((prev) => ({
            ...prev,
            [fieldName]: error,
        }));
    };

    const clearFieldError = (fieldName: string) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    };

    // 비밀번호 확인 필드 블러 핸들러
    const handleConfirmPasswordBlur = (value: string) => {
        const result = validateConfirmPassword(password, value);
        if (!result.isValid && result.error) {
            setFieldError('confirmPassword', result.error || '');
        } else {
            clearFieldError('confirmPassword');
        }
    };

    // 이메일 인증번호 전송
    const handleEmailVerification = () => {
        const emailResult = validateEmail(email);
        if (!emailResult.isValid) {
            const errorMessage =
                emailResult.error || '이메일 형식이 올바르지 않습니다.';
            setFieldError('email', errorMessage);
            addToast(errorMessage, 'error');
            return;
        }

        clearFieldError('email');
        sendVerificationCodeMutation.mutate(
            { email },
            {
                onSuccess: () => {
                    setIsVerificationCodeSent(true);
                    setIsEmailVerified(false);
                    setVerificationCode('');
                },
            },
        );
    };

    // 이메일 인증번호 검증
    const handleVerifyCode = () => {
        const codeResult = validateCode(verificationCode);
        if (!codeResult.isValid) {
            const errorMessage =
                codeResult.error || '인증번호 형식이 올바르지 않습니다.';
            setFieldError('code', errorMessage);
            addToast(errorMessage, 'error');
            return;
        }

        clearFieldError('code');
        verifyCodeMutation.mutate(
            { email, code: verificationCode },
            {
                onSuccess: () => {
                    setIsEmailVerified(true);
                },
            },
        );
    };

    // 회원가입 제출
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isEmailVerified) {
            setFieldError('email', '이메일 인증을 완료해주세요.');
            addToast('이메일 인증을 완료해주세요.', 'warning');
            return;
        }

        const validation = validateSignUp({
            email,
            password,
            confirmPassword,
            nickname,
        });

        if (!validation.isValid) {
            setErrors(validation.errors);
            const firstError = Object.values(validation.errors)[0];
            if (firstError) {
                addToast(firstError, 'error');
            }
            return;
        }

        setErrors({});
        registerMutation.mutate({ email, password, nickname });
    };

    return {
        // 상태
        email,
        verificationCode,
        password,
        confirmPassword,
        nickname,
        isVerificationCodeSent,
        isEmailVerified,
        errors,

        // 상태 변경 함수
        setEmail,
        setVerificationCode,
        setPassword,
        setConfirmPassword,
        setNickname,

        // 핸들러
        handleEmailVerification,
        handleVerifyCode,
        handleFieldBlur,
        handleConfirmPasswordBlur,
        handleSubmit,
    };
};
