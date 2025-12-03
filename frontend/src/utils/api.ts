import axios, {
    type AxiosRequestConfig,
    type AxiosResponse,
    AxiosError,
} from 'axios';
import { useToastStore } from '@/hooks/useToastStore';
// import { extractErrorMessage } from './errorHandler';

const baseURL = import.meta.env.VITE_SERVER_URL;

export interface ApiSuccessResponse<T = null> {
    success: true;
    code: string;
    message: string;
    result: T | null;
}

export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        field?: string;
    };
}

export type ApiResponse<T = null> = ApiSuccessResponse<T> | ApiErrorResponse;

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

interface RetryableRequestConfig extends AxiosRequestConfig {
    retry?: boolean;
}

// 액세스 토큰 갱신 시 사용하는 대기 배열
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
        if (
            error.response?.status === 401 &&
            !originalRequest.retry &&
            originalRequest.url !== '/auth/refresh' &&
            originalRequest.url !== '/auth/login'
        ) {
            if (isRefreshing) {
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
                console.log('리프레시 토큰으로 액세스 토큰 갱신 시도 중...');
                await axiosInstance.post('/auth/refresh');
                // eslint-disable-next-line no-console
                console.log('액세스 토큰 갱신 성공');
                processQueue(null, null);
                const retryResponse = await axiosInstance(originalRequest);
                return retryResponse;
            } catch (refreshError) {
                // eslint-disable-next-line no-console
                console.error('액세스 토큰 갱신 실패:', refreshError);
                processQueue(refreshError as AxiosError, null);

                if (window.location.pathname !== '/login') {
                    const { addToast } = useToastStore.getState();
                    addToast('로그인이 만료되었습니다', 'error');

                    setTimeout(() => {
                        window.location.replace('/login');
                    }, 500);
                }
                return await Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
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
