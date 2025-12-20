import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

export const ERROR_CODE_MESSAGES: Record<string, string> = {
    // 인증 관련 에러
    INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
    INVALID_TOKEN: '유효하지 않은 토큰입니다.',
    TOKEN_EXPIRED: '토큰이 만료되었습니다. 다시 로그인해주세요.',

    // 이메일 인증 관련 에러
    EMAIL_ALREADY_EXISTS: '이미 사용 중인 이메일입니다.',
    EMAIL_NOT_VERIFIED: '이메일 인증을 완료해주세요.',
    INVALID_VERIFICATION_CODE: '인증번호가 올바르지 않습니다.',
    VERIFICATION_CODE_EXPIRED: '인증번호가 만료되었습니다.',
    INVALID_EMAIL_FORMAT: '올바른 이메일 형식이 아닙니다.',
    EMAIL_SERVICE_UNAVAILABLE: '이메일 인증번호 발송 서버 오류입니다.',

    // 검증 에러
    VALIDATION_ERROR: '입력값이 올바르지 않습니다.',

    // 리소스 없음 에러
    USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
    SCHEDULE_NOT_FOUND: '일정을 찾을 수 없습니다.',
    REMINDER_NOT_FOUND: '리마인더를 찾을 수 없습니다.',
    ALARM_NOT_FOUND: '알람을 찾을 수 없습니다.',
    REMINDER_ALARM_NOT_FOUND: '리마인더 알람을 찾을 수 없습니다.',

    // 서버 에러
    INTERNAL_SERVER_ERROR:
        '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

/**
 * 작업별 기본 에러 메시지
 * 에러 코드가 없을 때 사용되는 폴백 메시지
 */
export const DEFAULT_OPERATION_MESSAGES: Record<string, string> = {
    create: '생성에 실패했습니다.',
    update: '수정에 실패했습니다.',
    delete: '삭제에 실패했습니다.',
    toggle: '상태 변경에 실패했습니다.',
    fetch: '데이터를 불러오는데 실패했습니다.',
    login: '로그인에 실패했습니다.',
    register: '회원가입에 실패했습니다.',
    verify: '인증에 실패했습니다.',
    send: '전송에 실패했습니다.',
};

/**
 * API 에러에서 사용자에게 표시할 메시지 추출
 * 프론트엔드에서 별도로 래핑하여 사용자에게 출력
 */
export const extractErrorMessage = (
    error: AxiosError<ApiErrorResponse>,
    operation?: string,
): string => {
    const errorCode = error.response?.data?.error?.code;
    if (errorCode && ERROR_CODE_MESSAGES[errorCode]) {
        return ERROR_CODE_MESSAGES[errorCode];
    }

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
                return operation && DEFAULT_OPERATION_MESSAGES[operation]
                    ? DEFAULT_OPERATION_MESSAGES[operation]
                    : '잘못된 요청입니다.';
            case 401:
                return '인증이 필요합니다.';
            case 403:
                return '접근 권한이 없습니다.';
            case 404:
                return operation && DEFAULT_OPERATION_MESSAGES[operation]
                    ? DEFAULT_OPERATION_MESSAGES[operation]
                    : '요청한 리소스를 찾을 수 없습니다.';
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

/**
 * React Query mutation의 onError 핸들러를 위한 에러 처리 함수
 * Toast 메시지를 자동으로 표시
 */
export const handleMutationError = (
    error: AxiosError<ApiErrorResponse>,
    operation?: string,
    addToast?: (
        message: string,
        variant: 'success' | 'warning' | 'error',
    ) => void,
): string => {
    const message = extractErrorMessage(error, operation);

    if (addToast) {
        addToast(message, 'error');
    }

    // 개발 환경에서 에러 로깅
    if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('Mutation Error:', {
            error,
            operation,
            message,
            errorCode: error.response?.data?.error?.code,
            status: error.response?.status,
        });
    }

    return message;
};
