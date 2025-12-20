// 📁 hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { authService } from '@/services/auth.service';
import { useToastStore } from '@/hooks/useToastStore';
import type { ApiErrorResponse } from '@/types/api';
import { useMutationErrorHandler } from '../useMutationErrorHandler';

interface LoginRequest {
    email: string;
    password: string;
}

export const useLogin = () => {
    const navigate = useNavigate();
    const { addToast } = useToastStore();
    const handleError = useMutationErrorHandler('login');

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

        onError: handleError,
    });
};
