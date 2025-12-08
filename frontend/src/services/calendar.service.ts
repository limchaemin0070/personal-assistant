import { defaultApi } from '@/utils/api';
import type { ScheduleResponse, CalendarEvent } from '@/types/calendar';
import type { EventTicketFormData } from '@/components/event/EventTicketForm';

export const calendarService = {
    // 특정 유저의 이벤트 조회
    async getEventsByUserId(): Promise<CalendarEvent[]> {
        const response = await defaultApi<ScheduleResponse[]>('/schedules', {
            method: 'GET',
        });

        if (!response.data.result) {
            return [];
        }

        // ScheduleResponse를 CalendarEvent로 변환
        return response.data.result.map((schedule) => ({
            id: schedule.schedule_id,
            title: schedule.title,
            memo: schedule.memo,
            startDate: new Date(schedule.start_date),
            endDate: new Date(schedule.end_date),
            startTime: schedule.start_time,
            endTime: schedule.end_time,
            isAllDay: schedule.is_all_day,
            notificationEnabled: schedule.notification_enabled,
            userId: schedule.user_id,
            createdAt: schedule.created_at
                ? new Date(schedule.created_at)
                : undefined,
            updatedAt: schedule.updated_at
                ? new Date(schedule.updated_at)
                : undefined,
        }));
    },

    // 일정 생성
    async createSchedule(data: EventTicketFormData): Promise<CalendarEvent> {
        const response = await defaultApi<ScheduleResponse>('/schedules', {
            method: 'POST',
            data,
        });

        if (!response.data.result) {
            throw new Error('일정 생성에 실패했습니다.');
        }

        const schedule = response.data.result;

        // ScheduleResponse를 CalendarEvent로 변환
        return {
            id: schedule.schedule_id,
            title: schedule.title,
            memo: schedule.memo,
            startDate: new Date(schedule.start_date),
            endDate: new Date(schedule.end_date),
            startTime: schedule.start_time,
            endTime: schedule.end_time,
            isAllDay: schedule.is_all_day,
            notificationEnabled: schedule.notification_enabled,
            userId: schedule.user_id,
            createdAt: schedule.created_at
                ? new Date(schedule.created_at)
                : undefined,
            updatedAt: schedule.updated_at
                ? new Date(schedule.updated_at)
                : undefined,
        };
    },

    // 일정 수정
    async updateSchedule(
        scheduleId: string | number,
        data: EventTicketFormData,
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

        const schedule = response.data.result;

        // ScheduleResponse를 CalendarEvent로 변환
        return {
            id: schedule.schedule_id,
            title: schedule.title,
            memo: schedule.memo,
            startDate: new Date(schedule.start_date),
            endDate: new Date(schedule.end_date),
            startTime: schedule.start_time,
            endTime: schedule.end_time,
            isAllDay: schedule.is_all_day,
            notificationEnabled: schedule.notification_enabled,
            userId: schedule.user_id,
            createdAt: schedule.created_at
                ? new Date(schedule.created_at)
                : undefined,
            updatedAt: schedule.updated_at
                ? new Date(schedule.updated_at)
                : undefined,
        };
    },

    // 일정 삭제
    async deleteSchedule(scheduleId: string | number): Promise<void> {
        await defaultApi(`/schedules/${scheduleId}`, {
            method: 'DELETE',
        });
    },
};
