import { useMemo } from 'react';
import { isSameDay, format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { calendarService } from '@/services/calendar.service';

/**
 * 이벤트 데이터 관리
 * @param currentDate 현재 선택된 날짜 (월 필터링용)
 */
export const useCalendarEvents = (currentDate: Date) => {
    // 유저ID로 모든 이벤트 조회
    const { data: allEvents = [], isLoading } = useQuery({
        queryKey: ['events', 'user'],
        queryFn: () => calendarService.getEventsByUserId(),
    });

    // 현재 월의 이벤트만 필터링
    const monthEvents = useMemo(() => {
        const monthKey = format(currentDate, 'yyyy-MM');
        return allEvents.filter((event) => {
            const eventMonth = format(event.startDate, 'yyyy-MM');
            return eventMonth === monthKey;
        });
    }, [allEvents, currentDate]);

    // 특정 날짜의 이벤트 조회
    const getEventsByDate = (date: Date) => {
        return monthEvents.filter((event) => isSameDay(event.startDate, date));
    };

    return {
        monthEvents,
        allEvents,
        getEventsByDate,
        isLoading,
    };
};
