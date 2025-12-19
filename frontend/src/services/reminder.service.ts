import { defaultApi } from '@/utils/api';
import type { ReminderResponse, Reminder } from '@/types/reminder';
import type { ReminderFormData } from '@/schemas/reminderSchema';
import {
    transformReminderResponse,
    transformReminderResponseArray,
} from '@/utils/transformers/reminderTransformer';

export const reminderService = {
    // 특정 유저의 리마인더 조회
    async getRemindersByUserId(): Promise<Reminder[]> {
        const response = await defaultApi<ReminderResponse[]>('/reminders', {
            method: 'GET',
        });

        if (!response.data.result) {
            return [];
        }

        return transformReminderResponseArray(response.data.result);
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

        return transformReminderResponse(response.data.result);
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

        return transformReminderResponse(response.data.result);
    },

    // 리마인더 완료 상태 토글
    async toggleComplete(reminderId: number, isCompleted: boolean) {
        return defaultApi(`/reminders/${reminderId}/complete`, {
            method: 'PATCH',
            data: { isCompleted },
        });
    },

    // 리마인더 삭제
    async deleteReminder(reminderId: string | number): Promise<void> {
        await defaultApi(`/reminders/${reminderId}`, {
            method: 'DELETE',
        });
    },
};
