/**
 * 리마인더 관련 타입 정의
 */

/**
 * 프론트엔드에서 사용하는 리마인더 타입
 * 백엔드 Reminder 모델과 매핑됨
 */
export interface Reminder {
    id: number; // reminder_id를 숫자로
    title: string;
    memo?: string | null;
    date?: Date | null; // date를 Date 객체로 변환
    time?: string | null; // "HH:mm" 형식
    isAllDay: boolean; // is_all_day
    isCompleted: boolean; // is_completed
    completedAt?: Date | null; // completed_at을 Date 객체로 변환
    notificationEnabled: boolean; // notification_enabled
    userId?: number; // user_id (필요한 경우)
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * 백엔드에서 받아오는 Reminder 응답 타입 (snake_case)
 */
export interface ReminderResponse {
    reminder_id: number;
    user_id: number;
    title: string;
    memo?: string | null;
    date?: string | null; // ISO date string
    time?: string | null;
    is_all_day: boolean;
    is_completed: boolean;
    completed_at?: string | null; // ISO date string
    notification_enabled: boolean;
    created_at?: string;
    updated_at?: string;
}
