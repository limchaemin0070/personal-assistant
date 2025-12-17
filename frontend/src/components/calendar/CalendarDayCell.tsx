// CalendarDayCell.tsx
import React from 'react';
import type { CalendarDay, EventLayout } from '@/types/calendar';
import { MonthEventTicket } from '../event/MonthEventTicket';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';

interface CalendarDayCellProps {
    day: CalendarDay;
    events: EventLayout[];
    hoveredEventId: number | null;
    onHover: (eventId: number | null) => void;
    onEventClick: (eventId: number) => void;
    onDoubleClick?: () => void;
}

// 이벤트 티켓 높이와 간격 상수
const EVENT_TICKET_HEIGHT = 20; // px
const EVENT_GAP = 2; // px (0.125rem = 2px)

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
    day,
    events,
    hoveredEventId,
    onHover,
    onEventClick,
    onDoubleClick,
}: CalendarDayCellProps) => {
    const dayOfWeek = day.date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dateKey = CalendarUtils.getDateKey(day.date);
    const cellRef = React.useRef<HTMLDivElement>(null);
    const eventsGridRef = React.useRef<HTMLDivElement>(null);
    const [maxVisibleEvents, setMaxVisibleEvents] = React.useState(4);

    // 리사이즈 감지 및 최대 표시 가능한 이벤트 개수 계산
    React.useEffect(() => {
        const calculateMaxEvents = () => {
            if (!eventsGridRef.current) return;

            const gridElement = eventsGridRef.current;
            const availableHeight = gridElement.clientHeight;

            // 사용 가능한 높이에서 표시할 수 있는 이벤트 개수 계산
            // 각 이벤트는 높이 20px + 간격 2px = 22px 필요
            const eventHeightWithGap = EVENT_TICKET_HEIGHT + EVENT_GAP;
            const calculatedMax = Math.max(
                1,
                Math.floor(availableHeight / eventHeightWithGap),
            );

            setMaxVisibleEvents(calculatedMax);
        };

        // 초기 계산 (약간의 지연을 두어 레이아웃이 완료된 후 계산)
        const timeoutId = setTimeout(calculateMaxEvents, 0);

        // ResizeObserver를 사용하여 리사이즈 감지
        // 부모 셀 요소를 관찰하여 셀 크기 변경 감지
        const resizeObserver = new ResizeObserver(() => {
            calculateMaxEvents();
        });

        if (cellRef.current) {
            resizeObserver.observe(cellRef.current);
        }

        // 창 리사이즈 이벤트도 감지 (추가 보장)
        window.addEventListener('resize', calculateMaxEvents);

        return () => {
            clearTimeout(timeoutId);
            resizeObserver.disconnect();
            window.removeEventListener('resize', calculateMaxEvents);
        };
    }, []);

    // 최대 개수만큼만 이벤트 필터링
    const visibleEvents = React.useMemo(() => {
        // row 순서대로 정렬하여 위에서부터 표시
        const sortedEvents = [...events].sort((a, b) => a.row - b.row);
        return sortedEvents.slice(0, maxVisibleEvents);
    }, [events, maxVisibleEvents]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onDoubleClick?.();
        }
    };

    return (
        <div
            ref={cellRef}
            className={`calendar-day-cell ${
                isWeekend ? 'calendar-day-cell-weekend' : ''
            }`}
            onDoubleClick={onDoubleClick}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <div
                className={`calendar-day-number ${
                    !day.isCurrentMonth ? 'calendar-day-number-other-month' : ''
                } ${day.isToday ? 'calendar-day-number-today' : ''}`}
            >
                {day.dayOfMonth}
            </div>
            <div ref={eventsGridRef} className="calendar-events-grid">
                {visibleEvents.map((eventLayout) => (
                    <MonthEventTicket
                        key={`${eventLayout.event.id}-${dateKey}`}
                        id={eventLayout.event.id}
                        title={eventLayout.event.title}
                        categoryColor={
                            eventLayout.event.categoryColor || '#3b82f6'
                        }
                        startDate={eventLayout.event.startDate}
                        endDate={eventLayout.event.endDate}
                        startTime={eventLayout.event.startTime}
                        endTime={eventLayout.event.endTime}
                        isAllDay={eventLayout.event.isAllDay}
                        row={eventLayout.row}
                        span={eventLayout.span}
                        isStart={eventLayout.isStart}
                        isEnd={eventLayout.isEnd}
                        isWeekStart={eventLayout.isWeekStart}
                        isHovered={hoveredEventId === eventLayout.event.id}
                        onHover={onHover}
                        onClick={onEventClick}
                        viewType="month"
                    />
                ))}
            </div>
        </div>
    );
};
