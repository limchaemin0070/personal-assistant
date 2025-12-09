import { endOfWeek, isSameDay, startOfWeek } from 'date-fns';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import type { CalendarEvent, EventLayout } from '@/types/calendar';

export const useCalendarLayout = () => {
    // 최대 표시할 이벤트 티켓 개수
    const MAX_EVENTS_PER_DAY = 4;

    // 사용 가능한 이벤트 레인을 찾는 함수 (세로로 어디에 들어가야 하는지)
    // existingEvent : { event: { id: 'A' }, row: 0 }
    const findAvailableRow = (
        existingEvents: EventLayout[], // 원래 있던 이벤트
        newEvent: CalendarEvent, // 새로 배치하려는 이벤트
    ): number | null => {
        // 이미 배치된 이벤트들에 같은 이벤트가 있는지 확인
        const existingLayout = existingEvents.find(
            (layout) => layout.event.id === newEvent.id,
        );
        // -> 같은 이벤트 있으면 같은 row 써야됨 -> 숫자 반환
        if (existingLayout) {
            return existingLayout.row;
        }

        // 없으면 사용중인 lane 수집
        // 그 일자의 이벤트만 순회해서 조회하면서 수집
        const usedRows = new Set(existingEvents.map((layout) => layout.row));

        // 남은 레인 중 가장 위부터 (작은 숫자) 할당
        let row = 0;
        while (usedRows.has(row) && row < MAX_EVENTS_PER_DAY) {
            row += 1;
        }

        // 최대 개수를 초과하면 null 반환
        if (row >= MAX_EVENTS_PER_DAY) {
            return null;
        }

        return row;
    };

    // span 계산 함수 (가로로 몇칸 차지하는지)
    const calculateSpanForDate = (
        event: CalendarEvent,
        currentDate: Date,
    ): number => {
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        const actualEnd = event.endDate < weekEnd ? event.endDate : weekEnd;
        const remainingDays = CalendarUtils.getDateRange(
            currentDate,
            actualEnd,
        );

        return remainingDays.length;
    };

    /**
     * 월간 뷰에서 필요한 이벤트 티켓들의 레이아웃을 계산하는 함수
     * @param events 월간 이벤트 목록 전체
     * @returns 이벤트 레이아웃 정보
     */
    const calculateMonthLayout = (
        events: CalendarEvent[],
    ): Map<string, EventLayout[]> => {
        // 1. 월 전체 이벤트 정렬
        // TODO : 종일 이벤트나 시간이 없는 이벤트 처리는 어떻게 할지...
        const sortedEvents = [...events].sort(
            (a, b) => a.startDate.getTime() - b.startDate.getTime(),
        );

        const eventsByDate = new Map<string, EventLayout[]>();

        sortedEvents.forEach((event) => {
            // 이 이벤트가 속해있는 모든 날짜
            const dateRange = CalendarUtils.getDateRange(
                event.startDate,
                event.endDate,
            );

            // 이벤트가 속해있는 날짜를 모두 순회하며 처리
            dateRange.forEach((date) => {
                // 이벤트 인덱싱용 날짜 키 생성
                const dateKey = CalendarUtils.getDateKey(date);

                if (!eventsByDate.has(dateKey)) {
                    eventsByDate.set(dateKey, []);
                }

                // 특정 날짜의 이벤트 목록
                const dayEvents = eventsByDate.get(dateKey)!;

                // row 할당 (일자별로 계산)
                const row = findAvailableRow(dayEvents, event);

                // 최대 개수를 초과하면 이벤트를 추가하지 않음
                if (row === null) {
                    return;
                }

                // span 계산
                const span = calculateSpanForDate(event, date);

                dayEvents.push({
                    event,
                    row,
                    span,
                    isStart: isSameDay(date, event.startDate),
                    isWeekStart: isSameDay(
                        date,
                        startOfWeek(date, { weekStartsOn: 0 }),
                    ),
                    isEnd: isSameDay(date, event.endDate),
                });
            });
        });

        return eventsByDate;
    };

    // 별도 이슈에서 작성

    // 주간 뷰에서 이벤트 티켓이 표시되어야 하는 위치 계산
    // const calculateWeekLayout = () => {};

    // 일간 뷰에서 이벤트 티켓이 표시되어야 하는 위치 계산
    // const calculateDayLayout = () => {};

    return {
        findAvailableRow,
        calculateSpanForDate,
        calculateMonthLayout,
    };
};
