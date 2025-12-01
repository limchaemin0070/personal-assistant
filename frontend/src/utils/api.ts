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

axiosInstance.interceptors.response.use(
    (response: AxiosResponse<ApiSuccessResponse>) => {
        console.log('API Response:', response.data);
        return response;
    },
    (error: AxiosError<ApiErrorResponse>) => {
        console.log('API Error:', error.response?.data || error.message);
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
