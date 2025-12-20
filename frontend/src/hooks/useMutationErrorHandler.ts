import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';
import { handleMutationError } from '@/utils/errorHandler';
import { useToastStore } from './useToastStore';

/**
 * React Query mutation에서 사용할 공통 에러 처리 hook
 * 
 * @param operation - 수행 중인 작업 (create, update, delete, toggle 등)
 * @returns 에러 핸들러 함수
 * 
 * @example
 * ```ts
 * const handleError = useMutationErrorHandler('create');
 * 
 * return useMutation({
 *   mutationFn: createAlarm,
 *   onError: handleError,
 * });
 * ```
 */
export const useMutationErrorHandler = (operation?: string) => {
    const { addToast } = useToastStore();

    return (error: AxiosError<ApiErrorResponse>) => {
        handleMutationError(error, operation, addToast);
    };
};

