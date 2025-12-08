// CalendarDayCell.tsx
import React from 'react';
import type { CalendarDay, EventLayout } from '@/types/calendar';
import { MonthEventTicket } from '../event/MonthEventTicket';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';

interface CalendarDayCellProps {
    day: CalendarDay;
    events: EventLayout[];
    hoveredEventId: string | null;
    onHover: (eventId: string | null) => void;
    onEventClick: (eventId: string) => void;
}

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
    day,
    events,
    hoveredEventId,
    onHover,
    onEventClick,
}: CalendarDayCellProps) => {
    const dayOfWeek = day.date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dateKey = CalendarUtils.getDateKey(day.date);

    return (
        <div
            className={`calendar-day-cell ${
                isWeekend ? 'calendar-day-cell-weekend' : ''
            }`}
        >
            <div
                className={`calendar-day-number ${
                    !day.isCurrentMonth ? 'calendar-day-number-other-month' : ''
                }`}
            >
                {day.dayOfMonth}
            </div>
            <div className="calendar-events-grid">
                {events.map((eventLayout) => (
                    <MonthEventTicket
                        key={`${eventLayout.event.id}-${dateKey}`}
                        id={String(eventLayout.event.id)}
                        title={eventLayout.event.title}
                        categoryColor={
                            eventLayout.event.categoryColor || '#3b82f6'
                        }
                        startDate={eventLayout.event.startDate}
                        endDate={eventLayout.event.endDate}
                        row={eventLayout.row}
                        span={eventLayout.span}
                        isStart={eventLayout.isStart}
                        isEnd={eventLayout.isEnd}
                        isWeekStart={eventLayout.isWeekStart}
                        isHovered={
                            hoveredEventId === String(eventLayout.event.id)
                        }
                        onHover={onHover}
                        onClick={onEventClick}
                    />
                ))}
            </div>
        </div>
    );
};
