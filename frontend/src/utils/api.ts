import axios, {
    type AxiosRequestConfig,
    type AxiosResponse,
    AxiosError,
} from 'axios';

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

export interface NetworkError {
    success: false;
    error: {
        code: string;
        message: string;
    };
}

export interface BackendErrorInfo {
    code: string;
    message: string;
    field?: string;
}

export interface ApiAxiosError extends AxiosError {
    backendError?: BackendErrorInfo;
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

        // 401 인증 만료
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
                await axiosInstance.post('/auth/refresh');
                processQueue(null, null);
                const retryResponse = await axiosInstance(originalRequest);
                return retryResponse;
            } catch (refreshError) {
                processQueue(refreshError as AxiosError, null);
                // 리프레시 실패 시 로그인 페이지로 리다이렉트
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return await Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

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
