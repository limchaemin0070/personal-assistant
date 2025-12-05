/**
 * 캘린더 관련 타입 정의
 */

/**
 * 캘린더 뷰 타입
 */
export type CalendarView = 'month' | 'week' | 'day';

/**
 * 캘린더 날짜 정보
 */
export interface CalendarDay {
    date: Date;
    dayOfMonth: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isPast: boolean;
}

/**
 * 캘린더에서 표시되는 이벤트의 기본 타입
 * 백엔드 Schedule 모델과 매핑됨
 */
export interface CalendarEvent {
    id: string | number; // schedule_id를 문자열 또는 숫자로
    title: string;
    memo?: string | null;
    startDate: Date; // start_date를 Date 객체로 변환
    endDate: Date; // end_date를 Date 객체로 변환
    startTime?: string | null; // "HH:mm" 형식
    endTime?: string | null; // "HH:mm" 형식
    isAllDay: boolean; // is_all_day
    notificationEnabled?: boolean; // notification_enabled
    categoryColor?: string; // 카테고리 색상 (프론트엔드에서 추가)
    userId?: number; // user_id (필요한 경우)
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * 월간 뷰에서 이벤트 티켓의 레이아웃 정보
 */
export interface EventLayout {
    event: CalendarEvent;
    row: number; // 세로 위치 (0부터 시작)
    span: number; // 가로로 차지하는 칸 수 (며칠간)
    isStart: boolean; // 시작일인지
    isEnd: boolean; // 종료일인지
}

/**
 * 백엔드에서 받아오는 Schedule 응답 타입 (snake_case)
 */
export interface ScheduleResponse {
    schedule_id: number;
    user_id: number;
    title: string;
    memo?: string | null;
    start_date: string; // ISO date string
    end_date: string; // ISO date string
    start_time?: string | null;
    end_time?: string | null;
    is_all_day: boolean;
    notification_enabled: boolean;
    created_at?: string;
    updated_at?: string;
}
