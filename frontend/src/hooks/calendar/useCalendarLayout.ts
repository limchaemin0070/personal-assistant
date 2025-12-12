import { endOfWeek, isSameDay, startOfWeek, startOfDay } from 'date-fns';
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
            // 멀티데이 이벤트의 경우 같은 주 내에서는 일관된 row를 유지해야 함
            // 주 경계(일요일)에서는 레인 계산을 새로 시작해야 함
            let assignedRow: number | null = null;
            let currentWeekStart: Date | null = null;

            dateRange.forEach((date) => {
                // 이벤트 인덱싱용 날짜 키 생성
                const dateKey = CalendarUtils.getDateKey(date);

                if (!eventsByDate.has(dateKey)) {
                    eventsByDate.set(dateKey, []);
                }

                // 특정 날짜의 이벤트 목록
                const dayEvents = eventsByDate.get(dateKey)!;

                // 주의 시작일 확인
                const weekStart = startOfWeek(date, { weekStartsOn: 0 });
                const isWeekStart = isSameDay(date, weekStart);

                // 주가 바뀌었으면 assignedRow를 리셋 (새 주에서는 레인 계산을 새로 시작)
                if (
                    currentWeekStart === null ||
                    !isSameDay(weekStart, currentWeekStart)
                ) {
                    assignedRow = null;
                    currentWeekStart = weekStart;
                }

                // row 할당
                // 주의 시작이거나 아직 row가 할당되지 않은 경우에는 새로 할당함
                // 같은 주 내에서는 이미 할당된 row를 유지함 (끊김방지)
                let row: number | null;
                if (assignedRow === null) {
                    // 주의 시작 또는 첫 날짜: 사용 가능한 row 찾기
                    row = findAvailableRow(dayEvents, event);
                    if (row !== null) {
                        assignedRow = row; // 할당된 row 저장
                    }
                } else {
                    // 같은 주 내의 이후 날짜: 이미 할당된 row 사용
                    // 하지만 해당 날짜에 이미 같은 이벤트가 있으면 그 row 사용 (중복 방지)
                    const existingLayout = dayEvents.find(
                        (layout) => layout.event.id === event.id,
                    );
                    if (existingLayout) {
                        row = existingLayout.row;
                    } else {
                        // 할당된 row가 해당 날짜에서 사용 가능한지 확인
                        const usedRows = new Set(
                            dayEvents.map((layout) => layout.row),
                        );
                        if (usedRows.has(assignedRow)) {
                            // 할당된 row가 이미 사용 중이면 다시 찾음 (충돌
                            row = findAvailableRow(dayEvents, event);
                            if (row !== null) {
                                assignedRow = row; // 새로운 row로 업데이트
                            }
                        } else {
                            row = assignedRow;
                        }
                    }
                }

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
                    isWeekStart,
                    isEnd: isSameDay(date, event.endDate),
                });
            });
        });

        return eventsByDate;
    };

    /**
     * 일간 뷰에서 특정 날짜의 이벤트 목록을 반환하는 함수
     * 일간 뷰에서는 제한 없이 모든 이벤트를 표시합니다.
     * 리마인더처럼 종일 이벤트를 먼저 표시하고, 이후 시작 시간 순으로 정렬합니다.
     * @param events 전체 이벤트 목록
     * @param targetDate 조회할 날짜
     * @returns 해당 날짜의 이벤트 목록 (시간순 정렬됨)
     */
    const calculateDayLayout = (
        events: CalendarEvent[],
        targetDate: Date,
    ): CalendarEvent[] => {
        const target = startOfDay(targetDate);

        const dayEvents = events.filter((event) => {
            const eventStart = startOfDay(event.startDate);
            const eventEnd = startOfDay(event.endDate);
            return target >= eventStart && target <= eventEnd;
        });

        // 시간순 정렬: 종일 -> 시작 시간 순
        return CalendarUtils.sortEventsByTime(dayEvents);
    };

    // 별도 이슈에서 작성

    // 주간 뷰에서 이벤트 티켓이 표시되어야 하는 위치 계산
    // const calculateWeekLayout = () => {};

    return {
        findAvailableRow,
        calculateSpanForDate,
        calculateMonthLayout,
        calculateDayLayout,
    };
};
