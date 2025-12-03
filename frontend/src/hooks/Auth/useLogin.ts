// 📁 hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { authService } from '@/services/auth.service';
import { useToastStore } from '@/hooks/useToastStore';
import type { ApiErrorResponse } from '@/utils/api';
import { extractErrorMessage } from '@/utils/errorHandler';

interface LoginRequest {
    email: string;
    password: string;
}

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
    INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
    VALIDATION_ERROR: '올바른 입력 형식이 아닙니다.',
    INTERNAL_SERVER_ERROR: '서버 오류가 발생했습니다.',
};

const getLoginErrorMessage = (error: AxiosError<ApiErrorResponse>): string => {
    const errorCode = error.response?.data?.error?.code;

    if (errorCode && LOGIN_ERROR_MESSAGES[errorCode]) {
        return LOGIN_ERROR_MESSAGES[errorCode];
    }

    return extractErrorMessage(error);
};

export const useLogin = () => {
    const navigate = useNavigate();
    const { addToast } = useToastStore();

    return useMutation<
        Awaited<ReturnType<typeof authService.login>>,
        AxiosError<ApiErrorResponse>,
        LoginRequest
    >({
        mutationFn: ({ email, password }: LoginRequest) =>
            authService.login(email, password),

        onSuccess: () => {
            addToast('로그인에 성공했습니다', 'success');
            navigate('/');
        },

        onError: (error: AxiosError<ApiErrorResponse>) => {
            const message = getLoginErrorMessage(error);
            addToast(message, 'error');
        },
    });
};
