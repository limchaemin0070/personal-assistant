import { useMemo, useCallback } from 'react';
import { CalendarUtils } from '@/utils/calendar';
import { isSameDay, isWithinInterval, startOfDay } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { calendarService } from '@/services/calendar.service';

/**
 * 이벤트 데이터 관리
 * @param events 해당하는 달의 이벤트 목록
 * @param currentDate 오늘 날짜
 */
export const useCalendarEvents = (
    events: CalendarEvent[],
    currentDate: Date,
) => {
    const { data: monthEvents, isLoading } = useQuery({
        queryKey: ['events', 'month', formatMonth(currentDate)],
        // calendarMonth 구현중
        queryFn: () => calendarService.getEventsByMonth(currentDate),
    });

    // 특정 날짜의 이벤트 조회
    const getEventsByDate = (date: Date) => {
        return (
            monthEvents?.filter((event) => isSameDay(event.startDate, date)) ||
            []
        );
    };

    return {
        monthEvents,
        getEventsByDate,
        isLoading,
    };
};
