/**
 * 알람 데이터 변환 유틸리티
 * 백엔드 AlarmResponse를 프론트엔드 Alarm 타입으로 변환
 */
import type { AlarmResponse, Alarm } from '@/types/alarm';

/**
 * AlarmResponse를 Alarm로 변환
 * @param response 백엔드에서 받은 AlarmResponse
 * @returns 프론트엔드에서 사용하는 Alarm 타입
 */
export const transformAlarmResponse = (response: AlarmResponse): Alarm => {
    return {
        id: response.alarm_id,
        title: response.title || '',
        time: response.time,
        date: response.date ? new Date(response.date) : null,
        repeat_days: response.repeat_days
            ? JSON.parse(response.repeat_days)
            : null,
        is_repeat: response.is_repeat,
        is_active: response.is_active,
        userId: response.user_id,
        next_trigger_at: response.next_trigger_at
            ? new Date(response.next_trigger_at)
            : null,
        last_triggered_at: response.last_triggered_at
            ? new Date(response.last_triggered_at)
            : null,
        trigger_count: response.trigger_count,
        createdAt: response.created_at
            ? new Date(response.created_at)
            : undefined,
        updatedAt: response.updated_at
            ? new Date(response.updated_at)
            : undefined,
    };
};

/**
 * AlarmResponse 배열을 Alarm 배열로 변환
 * @param responses AlarmResponse 배열
 * @returns Alarm 배열
 */
export const transformAlarmResponseArray = (
    responses: AlarmResponse[],
): Alarm[] => {
    return responses.map(transformAlarmResponse);
};
