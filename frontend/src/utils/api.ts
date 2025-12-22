import axios, {
    type AxiosRequestConfig,
    type AxiosResponse,
    AxiosError,
} from 'axios';
import { useToastStore } from '@/hooks/useToastStore';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types/api';
import { getIsLoggingOut } from './apiState';
// import { extractErrorMessage } from './errorHandler';

const baseURL = import.meta.env.VITE_SERVER_URL;

interface RetryableRequestConfig extends AxiosRequestConfig {
    retry?: boolean;
}

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (error?: unknown) => void;
}> = [];

const processQueue = (
    error: AxiosError | null,
    token: string | null = null,
) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response: AxiosResponse<ApiSuccessResponse>) => {
        if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log('API Response:', response.data);
        }
        return response;
    },
    async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as RetryableRequestConfig;

        // 401 인증 만료 처리
        if (error.response?.status === 401) {
            const errorCode = error.response?.data?.error?.code;
            const requestUrl = originalRequest?.url || '';

            // 인증 관련 공개 API는 토큰 갱신 시도하지 않음
            const isPublicAuthEndpoint =
                requestUrl.includes('/auth/login') ||
                requestUrl.includes('/auth/sign-up') ||
                requestUrl.includes('/auth/email-verifications') ||
                requestUrl.includes('/auth/verify');

            // INVALID_CREDENTIALS 같은 인증 실패 에러는 토큰 갱신하지 않음
            const isAuthenticationFailure = errorCode === 'INVALID_CREDENTIALS';

            // 디버깅: 재시도 조건 확인
            if (import.meta.env.DEV) {
                // eslint-disable-next-line no-console
                console.log('401 에러 감지:', {
                    url: originalRequest?.url,
                    method: originalRequest?.method,
                    errorCode,
                    isPublicAuthEndpoint,
                    isAuthenticationFailure,
                    hasConfig: !!originalRequest,
                    alreadyRetried: originalRequest?.retry,
                    isLoggingOut: getIsLoggingOut(),
                    isRefreshing,
                });
            }

            // 재시도 조건 확인 (공개 인증 API나 인증 실패 에러는 제외)
            if (
                originalRequest && // error.config가 존재하는지 확인
                !originalRequest.retry &&
                !getIsLoggingOut() &&
                !isPublicAuthEndpoint &&
                !isAuthenticationFailure
            ) {
                if (isRefreshing) {
                    // eslint-disable-next-line no-console
                    console.log(
                        '토큰 갱신 중이므로 대기열에 추가:',
                        originalRequest.url,
                    );
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                        .then(() => {
                            return axiosInstance(originalRequest);
                        })
                        .catch((err) => {
                            return Promise.reject(err);
                        });
                }

                originalRequest.retry = true;
                isRefreshing = true;

                try {
                    // eslint-disable-next-line no-console
                    console.log(
                        '리프레시 토큰으로 액세스 토큰 갱신 시도 중...',
                    );
                    await axiosInstance.post('/auth/refresh');
                    // eslint-disable-next-line no-console
                    console.log('액세스 토큰 갱신 성공');
                    processQueue(null, null);
                    // eslint-disable-next-line no-console
                    console.log(
                        '원본 요청 재시도:',
                        originalRequest.method,
                        originalRequest.url,
                    );
                    const retryResponse = await axiosInstance(originalRequest);
                    return retryResponse;
                } catch (refreshError) {
                    // eslint-disable-next-line no-console
                    console.error('액세스 토큰 갱신 실패:', refreshError);
                    processQueue(refreshError as AxiosError, null);

                    // 공개 페이지가 아니고, 로그인 페이지가 아닐 때만 리다이렉트
                    if (
                        window.location.pathname !== '/login' &&
                        window.location.pathname !== '/register'
                    ) {
                        // const { addToast } = useToastStore.getState();
                        // addToast('로그인이 만료되었습니다', 'error');

                        setTimeout(() => {
                            window.location.replace('/login');
                        }, 500);
                    }
                    return await Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else if (import.meta.env.DEV) {
                let reason: string;
                if (!originalRequest) {
                    reason = 'error.config가 없음';
                } else if (originalRequest.retry) {
                    reason = '이미 재시도함';
                } else if (getIsLoggingOut()) {
                    reason = '로그아웃 중';
                } else {
                    reason = '알 수 없는 이유';
                }
                // eslint-disable-next-line no-console
                console.warn('401 에러지만 재시도하지 않음:', {
                    url: originalRequest?.url,
                    reason,
                });
            }
        }

        if (!error.request) {
            const { addToast } = useToastStore.getState();
            addToast('네트워크 연결을 확인해주세요.', 'error');
        }

        // 프로덕션 환경에서는 이부분 제거
        if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log('API Error:', error.response?.data || error.message);
        }

        return Promise.reject(error);
    },
);

export const defaultApi = <T = null>(
    url: string,
    config?: AxiosRequestConfig,
): Promise<AxiosResponse<ApiSuccessResponse<T>>> => {
    return axiosInstance.request<ApiSuccessResponse<T>>({
        url,
        ...config,
    });
};
