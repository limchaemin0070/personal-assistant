import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { userService } from '@/services/user.service';
import type { ApiErrorResponse } from '@/types/api';

/**
 * 인증 상태를 관리하는 훅
 * httpOnly 쿠키 환경에서 API 호출을 통해 인증 상태를 확인합니다.
 *
 * @returns {Object} 인증 상태 정보
 * - user: 현재 로그인한 사용자 정보
 * - isAuthenticated: 인증된 사용자 여부
 * - isUnauthorized: 인증 실패 여부 (401 에러)
 * - error: 에러 정보
 */
export const useAuth = () => {
    const { data, isError, error, isLoading } = useQuery({
        queryKey: ['auth', 'me'],
        queryFn: async () => {
            const response = await userService.getCurrentUser();
            return response.result;
        },
        retry: (failureCount, err) => {
            // 401 에러는 재시도하지 않음 (인터셉터에서 처리)
            const axiosError = err as { response?: { status?: number } };
            if (axiosError?.response?.status === 401) {
                return false;
            }
            return failureCount < 1;
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchInterval: false,
    });

    const isAuthenticated = !!data && !isError;
    const authError = error as AxiosError<ApiErrorResponse> | undefined;
    const isUnauthorized =
        authError?.response?.status === 401 ||
        authError?.response?.data?.error?.code === 'INVALID_TOKEN';

    return {
        user: data,
        isAuthenticated,
        isLoading,
        isUnauthorized,
        error: authError,
    };
};
