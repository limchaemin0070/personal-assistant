import { defaultApi } from '@/utils/api';
import type { ScheduleResponse, CalendarEvent } from '@/types/calendar';
import type { EventFormData } from '@/schemas/eventSchema';
import {
    transformScheduleResponse,
    transformScheduleResponseArray,
} from '@/utils/transformers/calendarTransformer';

export const calendarService = {
    // 특정 유저의 이벤트 조회
    async getEventsByUserId(): Promise<CalendarEvent[]> {
        const response = await defaultApi<ScheduleResponse[]>('/schedules', {
            method: 'GET',
        });

        if (!response.data.result) {
            return [];
        }

        return transformScheduleResponseArray(response.data.result);
    },

    // 일정 생성
    async createSchedule(data: EventFormData): Promise<CalendarEvent> {
        const response = await defaultApi<ScheduleResponse>('/schedules', {
            method: 'POST',
            data,
        });

        if (!response.data.result) {
            throw new Error('일정 생성에 실패했습니다.');
        }

        return transformScheduleResponse(response.data.result);
    },

    // 일정 수정
    async updateSchedule(
        scheduleId: string | number,
        data: EventFormData,
    ): Promise<CalendarEvent> {
        const response = await defaultApi<ScheduleResponse>(
            `/schedules/${scheduleId}`,
            {
                method: 'PUT',
                data,
            },
        );

        if (!response.data.result) {
            throw new Error('일정 수정에 실패했습니다.');
        }

        return transformScheduleResponse(response.data.result);
    },

    // 일정 삭제
    async deleteSchedule(scheduleId: string | number): Promise<void> {
        await defaultApi(`/schedules/${scheduleId}`, {
            method: 'DELETE',
        });
    },
};
