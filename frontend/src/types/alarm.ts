/**
 * 알람 관련 타입 정의
 */

/**
 * 프론트엔드에서 사용하는 알람 타입
 * 백엔드 Alarm 모델과 매핑됨
 */
export interface Alarm {
    id: number; // alarm_id를 숫자로
    title: string;
    time: string; // "HH:mm" 형식
    date?: Date | null;
    repeat_days?: number[] | null; // [0, 1, 2] 형식 (0: 일요일, 6: 토요일)
    is_repeat: boolean;
    is_active: boolean;
    userId?: number; // user_id
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * 백엔드에서 받아오는 Alarm 응답 타입 (snake_case)
 */
export interface AlarmResponse {
    alarm_id: number;
    user_id: number;
    schedule_id?: number | null;
    reminder_id?: number | null;
    title?: string;
    date?: string | null; // ISO date string
    time: string;
    is_repeat: boolean;
    repeat_days?: string | null; // JSON string
    is_active: boolean;
    alarm_type: 'basic' | 'event';
    created_at?: string;
    updated_at?: string;
}

