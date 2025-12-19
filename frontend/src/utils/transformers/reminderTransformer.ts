/**
 * 리마인더 데이터 변환 유틸리티
 * 백엔드 ReminderResponse를 프론트엔드 Reminder 타입으로 변환함
 */
import type { ReminderResponse, Reminder } from '@/types/reminder';

/**
 * ReminderResponse를 Reminder로 변환
 * @param response 백엔드에서 받은 ReminderResponse
 * @returns 프론트엔드에서 사용하는 Reminder 타입
 */
export const transformReminderResponse = (
    response: ReminderResponse,
): Reminder => {
    return {
        id: response.reminder_id,
        title: response.title,
        memo: response.memo,
        date: response.date ? new Date(response.date) : null,
        time: response.time,
        isAllDay: response.is_all_day,
        isCompleted: response.is_completed,
        completedAt: response.completed_at
            ? new Date(response.completed_at)
            : null,
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
 * ReminderResponse 배열을 Reminder 배열로 변환
 * @param responses ReminderResponse 배열
 * @returns Reminder 배열
 */
export const transformReminderResponseArray = (
    responses: ReminderResponse[],
): Reminder[] => {
    return responses.map(transformReminderResponse);
};
