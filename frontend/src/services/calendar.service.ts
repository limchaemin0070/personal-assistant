import {
    format,
    startOfMonth,
    endOfMonth,
    subMonths,
    addMonths,
} from 'date-fns';
import { defaultApi } from '@/utils/api';
import type { ScheduleResponse, CalendarEvent } from '@/types/calendar';
import type { EventFormData } from '@/schemas/eventSchema';
import {
    transformScheduleResponse,
    transformScheduleResponseArray,
} from '@/utils/transformers/calendarTransformer';

interface EventsRangeResponse {
    data: ScheduleResponse[];
    meta: {
        count: number;
        range: {
            start: string;
            end: string;
        };
    };
}

export const calendarService = {
    /**
     * 날짜 범위로 이벤트 조회
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @param limit 최대 조회 개수 (기본값 500, 최대 1000)
     * @returns 이벤트 배열
     */
    async getEventsByRange(
        startDate: Date,
        endDate: Date,
        limit?: number,
    ): Promise<CalendarEvent[]> {
        try {
            const startDateStr = format(startDate, 'yyyy-MM-dd');
            const endDateStr = format(endDate, 'yyyy-MM-dd');

            const params = new URLSearchParams({
                startDate: startDateStr,
                endDate: endDateStr,
            });

            if (limit) {
                params.append('limit', limit.toString());
            }

            const response = await defaultApi<EventsRangeResponse>(
                `/schedules?${params.toString()}`,
                {
                    method: 'GET',
                },
            );

            if (!response.data.result || !response.data.result.data) {
                return [];
            }

            return transformScheduleResponseArray(response.data.result.data);
        } catch (error) {
            // 네트워크 에러 또는 API 에러 처리
            if (error instanceof Error) {
                throw new Error(`이벤트 조회에 실패했습니다: ${error.message}`);
            }
            throw new Error('이벤트 조회에 실패했습니다.');
        }
    },

    /**
     * 캘린더 뷰용 이벤트 조회 (현재 날짜 기준 ±1개월)
     * @param currentDate 현재 날짜
     * @returns 이벤트 배열
     */
    async getEventsForCalendarView(
        currentDate: Date,
    ): Promise<CalendarEvent[]> {
        // 현재 날짜 기준 -1개월 ~ +1개월 범위 계산
        const rangeStart = startOfMonth(subMonths(currentDate, 1));
        const rangeEnd = endOfMonth(addMonths(currentDate, 1));

        return this.getEventsByRange(rangeStart, rangeEnd);
    },

    // 특정 유저의 이벤트 조회 (혹시 나중에 대시보드 등 생기면 사용)
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
