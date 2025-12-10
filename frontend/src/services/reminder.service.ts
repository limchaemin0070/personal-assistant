import { defaultApi } from '@/utils/api';
import type { ReminderResponse, Reminder } from '@/types/reminder';
import type { ReminderFormData } from '@/schemas/reminderSchema';

export const reminderService = {
    // 특정 유저의 리마인더 조회
    async getRemindersByUserId(): Promise<Reminder[]> {
        const response = await defaultApi<ReminderResponse[]>('/reminders', {
            method: 'GET',
        });

        if (!response.data.result) {
            return [];
        }

        // ReminderResponse를 Reminder로 변환
        return response.data.result.map((reminder) => ({
            id: reminder.reminder_id,
            title: reminder.title,
            memo: reminder.memo,
            date: reminder.date ? new Date(reminder.date) : null,
            time: reminder.time,
            isAllDay: reminder.is_all_day,
            isCompleted: reminder.is_completed,
            completedAt: reminder.completed_at
                ? new Date(reminder.completed_at)
                : null,
            notificationEnabled: reminder.notification_enabled,
            userId: reminder.user_id,
            createdAt: reminder.created_at
                ? new Date(reminder.created_at)
                : undefined,
            updatedAt: reminder.updated_at
                ? new Date(reminder.updated_at)
                : undefined,
        }));
    },

    // 리마인더 생성
    async createReminder(data: ReminderFormData): Promise<Reminder> {
        const response = await defaultApi<ReminderResponse>('/reminders', {
            method: 'POST',
            data,
        });

        if (!response.data.result) {
            throw new Error('리마인더 생성에 실패했습니다.');
        }

        const reminder = response.data.result;

        // ReminderResponse를 Reminder로 변환
        return {
            id: reminder.reminder_id,
            title: reminder.title,
            memo: reminder.memo,
            date: reminder.date ? new Date(reminder.date) : null,
            time: reminder.time,
            isAllDay: reminder.is_all_day,
            isCompleted: reminder.is_completed,
            completedAt: reminder.completed_at
                ? new Date(reminder.completed_at)
                : null,
            notificationEnabled: reminder.notification_enabled,
            userId: reminder.user_id,
            createdAt: reminder.created_at
                ? new Date(reminder.created_at)
                : undefined,
            updatedAt: reminder.updated_at
                ? new Date(reminder.updated_at)
                : undefined,
        };
    },

    // 리마인더 수정
    async updateReminder(
        reminderId: string | number,
        data: ReminderFormData,
    ): Promise<Reminder> {
        const response = await defaultApi<ReminderResponse>(
            `/reminders/${reminderId}`,
            {
                method: 'PUT',
                data,
            },
        );

        if (!response.data.result) {
            throw new Error('리마인더 수정에 실패했습니다.');
        }

        const reminder = response.data.result;

        // ReminderResponse를 Reminder로 변환
        return {
            id: reminder.reminder_id,
            title: reminder.title,
            memo: reminder.memo,
            date: reminder.date ? new Date(reminder.date) : null,
            time: reminder.time,
            isAllDay: reminder.is_all_day,
            isCompleted: reminder.is_completed,
            completedAt: reminder.completed_at
                ? new Date(reminder.completed_at)
                : null,
            notificationEnabled: reminder.notification_enabled,
            userId: reminder.user_id,
            createdAt: reminder.created_at
                ? new Date(reminder.created_at)
                : undefined,
            updatedAt: reminder.updated_at
                ? new Date(reminder.updated_at)
                : undefined,
        };
    },

    // 리마인더 삭제
    async deleteReminder(reminderId: string | number): Promise<void> {
        await defaultApi(`/reminders/${reminderId}`, {
            method: 'DELETE',
        });
    },
};
