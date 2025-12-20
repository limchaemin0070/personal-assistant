// 📁 hooks/useRegister.ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { authService } from '@/services/auth.service';
import { useToastStore } from '@/hooks/useToastStore';
import type { ApiErrorResponse } from '@/types/api';
import { useMutationErrorHandler } from '../useMutationErrorHandler';

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

// 이메일 인증 코드 발송 mutation
export const useSendVerificationCode = () => {
    const { addToast } = useToastStore();
    const handleError = useMutationErrorHandler('send');

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

        onError: handleError,
    });
};

// 이메일 인증 코드 검증 mutation
export const useVerifyCode = () => {
    const { addToast } = useToastStore();
    const handleError = useMutationErrorHandler('verify');

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

        onError: handleError,
    });
};

// 회원가입 mutation
export const useRegister = () => {
    const navigate = useNavigate();
    const { addToast } = useToastStore();
    const handleError = useMutationErrorHandler('register');

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

        onError: handleError,
    });
};
