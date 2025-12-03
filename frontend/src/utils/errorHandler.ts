import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from './api';

/**
 * API 에러에서 사용자에게 표시할 메시지 추출
 * 프론트엔드에서 별도로 래핑하여 사용자에게 출력
 *
 * @param error - Axios 에러 객체
 * @returns 사용자에게 표시할 에러 메시지
 */
export const extractErrorMessage = (
    error: AxiosError<ApiErrorResponse>,
): string => {
    // 백엔드에서 반환한 에러 메시지 (최우선)
    if (error.response?.data?.error?.message) {
        return error.response.data.error.message;
    }

    // 네트워크 에러
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
        return '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.';
    }

    // 타임아웃 에러
    if (error.code === 'ETIMEDOUT') {
        return '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
    }

    // HTTP 상태 코드별 기본 메시지
    const status = error.response?.status;
    if (status) {
        switch (status) {
            case 400:
                return '잘못된 요청입니다.';
            case 401:
                return '인증이 필요합니다.';
            case 403:
                return '접근 권한이 없습니다.';
            case 404:
                return '요청한 리소스를 찾을 수 없습니다.';
            case 409:
                return '이미 존재하는 데이터입니다.';
            case 422:
                return '입력값이 올바르지 않습니다.';
            case 500:
                return '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
            case 502:
                return '서버 게이트웨이 오류가 발생했습니다.';
            case 503:
                return '서비스를 일시적으로 사용할 수 없습니다.';
            case 504:
                return '서버 응답 시간이 초과되었습니다.';
            default:
                return error.message || '알 수 없는 오류가 발생했습니다.';
        }
    }

    // 기본 에러 메시지
    return error.message || '알 수 없는 오류가 발생했습니다.';
};
