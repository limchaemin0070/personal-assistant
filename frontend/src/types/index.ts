/**
 * 공통 타입 정의 통합 export
 */

// API 관련 타입
export type { ApiSuccessResponse, ApiErrorResponse, ApiResponse } from './api';

// 인증 관련 타입
export type {
    SendVerificationCodeRequest,
    SendVerificationCodeResponse,
    VerifyCodeRequest,
    VerifyCodeResponse,
    SignUpRequest,
    SignUpResponse,
    LoginRequest,
    LoginResponse,
} from './auth';

// 사용자 관련 타입
export type { UserInfo } from './user';

// 캘린더 관련 타입
export type {
    CalendarView,
    CalendarDay,
    CalendarEvent,
    EventLayout,
    ScheduleResponse,
} from './calendar';

// 리마인더 관련 타입
export type {
    Reminder,
    ReminderResponse,
} from './reminder';

// 알람 관련 타입
export type {
    Alarm,
    AlarmResponse,
} from './alarm';

// Toast 관련 타입
export type { ToastVariant, Toast, ToastStore } from './toast';
