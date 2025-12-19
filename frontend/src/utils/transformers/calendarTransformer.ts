/**
 * 캘린더 데이터 변환 유틸리티
 * 백엔드 ScheduleResponse를 프론트엔드 CalendarEvent 타입으로 변환함
 */
import type { ScheduleResponse, CalendarEvent } from '@/types/calendar';

/**
 * ScheduleResponse를 CalendarEvent로 변환
 * @param response 백엔드에서 받은 ScheduleResponse
 * @returns 프론트엔드에서 사용하는 CalendarEvent 타입
 */
export const transformScheduleResponse = (
    response: ScheduleResponse,
): CalendarEvent => {
    return {
        id: response.schedule_id,
        title: response.title,
        memo: response.memo,
        startDate: new Date(response.start_date),
        endDate: new Date(response.end_date),
        startTime: response.start_time,
        endTime: response.end_time,
        isAllDay: response.is_all_day,
        notificationEnabled: response.notification_enabled,
        userId: response.user_id,
        createdAt: response.created_at
            ? new Date(response.created_at)
            : undefined,
        updatedAt: response.updated_at
            ? new Date(response.updated_at)
            : undefined,
    };
};

/**
 * ScheduleResponse 배열을 CalendarEvent 배열로 변환
 * @param responses ScheduleResponse 배열
 * @returns CalendarEvent 배열
 */
export const transformScheduleResponseArray = (
    responses: ScheduleResponse[],
): CalendarEvent[] => {
    return responses.map(transformScheduleResponse);
};
