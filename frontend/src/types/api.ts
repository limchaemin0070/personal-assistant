/**
 * API 응답 관련 타입 정의
 */

/**
 * 성공 응답 타입
 */
export interface ApiSuccessResponse<T = null> {
    success: true;
    code: string;
    message: string;
    result: T | null;
}

/**
 * 에러 응답 타입
 */
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        field?: string;
    };
}

/**
 * API 응답 유니온 타입
 */
export type ApiResponse<T = null> = ApiSuccessResponse<T> | ApiErrorResponse;
