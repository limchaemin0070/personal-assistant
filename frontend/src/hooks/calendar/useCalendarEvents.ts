import { useMemo } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    startOfDay,
    endOfDay,
    isWithinInterval,
    subMonths,
    addMonths,
} from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { calendarService } from '@/services/calendar.service';
import { queryKeys } from '@/lib/queryKeys';
import type { CalendarEvent, CalendarView } from '@/types/calendar';

/**
 * 이벤트가 특정 기간과 겹치는지 확인
 * @param event 이벤트
 * @param periodStart 기간 시작
 * @param periodEnd 기간 종료
 * @returns 겹치는지 여부
 */
const isEventOverlappingPeriod = (
    event: CalendarEvent,
    periodStart: Date,
    periodEnd: Date,
): boolean => {
    const eventStart = event.startDate;
    const eventEnd = event.endDate;

    // 이벤트 시작일이 기간 내에 있음
    if (isWithinInterval(eventStart, { start: periodStart, end: periodEnd })) {
        return true;
    }

    // 이벤트 종료일이 기간 내에 있음
    if (isWithinInterval(eventEnd, { start: periodStart, end: periodEnd })) {
        return true;
    }

    // 이벤트가 기간을 완전히 가로지름 (eventStart < periodStart AND eventEnd > periodEnd)
    if (eventStart <= periodStart && eventEnd >= periodEnd) {
        return true;
    }

    return false;
};

/**
 * 이벤트 데이터 관리 (범위 기반)
 * @param currentDate 현재 선택된 날짜
 * @param view 캘린더 뷰 타입 (month/week/day)
 */
export const useCalendarEvents = (currentDate: Date, view?: CalendarView) => {
    // 범위 계산 (currentDate 기준 ±1개월, 뷰랑 상관없음)
    const rangeStart = useMemo(
        () => startOfMonth(subMonths(currentDate, 1)),
        [currentDate],
    );
    const rangeEnd = useMemo(
        () => endOfMonth(addMonths(currentDate, 1)),
        [currentDate],
    );

    const {
        data: allEvents = [],
        isLoading,
        isFetching,
        error,
    } = useQuery({
        queryKey: queryKeys.events.range(format(rangeStart, 'yyyy-MM')),
        queryFn: () => calendarService.getEventsForCalendarView(currentDate),
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 30 * 60 * 1000, // 30분
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    // 뷰별 필터링
    const events = useMemo(() => {
        if (!view) {
            return allEvents;
        }

        let periodStart: Date;
        let periodEnd: Date;

        switch (view) {
            case 'month': {
                // 현재 월의 시작과 끝
                periodStart = startOfMonth(currentDate);
                periodEnd = endOfMonth(currentDate);
                break;
            }
            case 'week': {
                // 현재 주의 시작과 끝
                periodStart = startOfWeek(currentDate, { weekStartsOn: 0 });
                periodEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
                break;
            }
            case 'day': {
                // 현재 일의 시작과 끝
                periodStart = startOfDay(currentDate);
                periodEnd = endOfDay(currentDate);
                break;
            }
            default:
                return allEvents;
        }

        return allEvents.filter((event) =>
            isEventOverlappingPeriod(event, periodStart, periodEnd),
        );
    }, [allEvents, currentDate, view]);

    // 특정 날짜의 이벤트 조회
    const getEventsByDate = useMemo(
        () => (date: Date) => {
            return allEvents.filter((event) => {
                const eventStart = event.startDate;
                const eventEnd = event.endDate;
                const dayStart = startOfDay(date);
                const dayEnd = endOfDay(date);

                return isEventOverlappingPeriod(event, dayStart, dayEnd);
            });
        },
        [allEvents],
    );

    const meta = useMemo(
        () => ({
            cachedRange: {
                start: format(rangeStart, 'yyyy-MM-dd'),
                end: format(rangeEnd, 'yyyy-MM-dd'),
            },
            totalCached: allEvents.length,
            displayed: events.length,
        }),
        [rangeStart, rangeEnd, allEvents.length, events.length],
    );

    return {
        events,
        allEvents,
        isLoading,
        isFetching,
        error: error as Error | null,
        getEventsByDate,
        meta,
    };
};
