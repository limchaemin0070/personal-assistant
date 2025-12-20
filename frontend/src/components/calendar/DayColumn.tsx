import React from 'react';
import { isToday } from 'date-fns';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import { MonthEventTicket } from '../event/MonthEventTicket';
import { Loading } from '../common/Loading';
import type { CalendarEvent } from '@/types/calendar';
import { cn } from '@/utils/cn';

interface DayColumnProps {
    date: Date;
    events: CalendarEvent[];
    isLoading: boolean;
    viewType: 'day' | 'week';
    hoveredEventId: number | null;
    onHover: (id: number | null) => void;
    onEventClick: (eventId: number) => void;
    className?: string;
}

export const DayColumn: React.FC<DayColumnProps> = ({
    date,
    events,
    isLoading,
    viewType,
    hoveredEventId,
    onHover,
    onEventClick,
    className = '',
}) => {
    const dateKey = CalendarUtils.getDateKey(date);

    const headerSizeClass = viewType === 'day' ? 'text-4xl' : 'text-2xl';
    const dayOfWeekSizeClass = viewType === 'day' ? 'text-lg' : 'text-sm';

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isTodayDate = isToday(date);

    let dateColorClass = 'text-gray-900';
    if (isTodayDate) {
        dateColorClass = 'text-blue-600';
    } else if (isWeekend) {
        dateColorClass = 'text-red-600';
    }

    return (
        <div className={cn('flex flex-col flex-1 min-h-0', className)}>
            <div className="sticky top-0 z-10 bg-white border-b border-gray-300 shrink-0">
                <div className="flex flex-col items-center px-2 py-3">
                    <div
                        className={cn(
                            'font-bold',
                            headerSizeClass,
                            dateColorClass,
                        )}
                    >
                        {date.getDate()}
                    </div>
                    <div
                        className={cn(
                            'font-bold',
                            dayOfWeekSizeClass,
                            'text-gray-600',
                        )}
                    >
                        {CalendarUtils.formatDayOfWeek(date)}
                    </div>
                </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loading
                            size={viewType === 'day' ? 'lg' : 'md'}
                            color="blue"
                        />
                    </div>
                ) : (
                    <div
                        className={cn(
                            'flex flex-col',
                            viewType === 'day' ? 'gap-1 p-5' : 'gap-1 p-3',
                        )}
                    >
                        {events.length === 0 ? (
                            <div className="text-center text-gray-400 py-8">
                                일정 없음
                            </div>
                        ) : (
                            events.map((event) => (
                                <MonthEventTicket
                                    key={`${event.id}-${dateKey}`}
                                    id={event.id}
                                    title={event.title}
                                    categoryColor={
                                        event.categoryColor || '#3b82f6'
                                    }
                                    startDate={event.startDate}
                                    endDate={event.endDate}
                                    startTime={event.startTime}
                                    endTime={event.endTime}
                                    isAllDay={event.isAllDay}
                                    row={0}
                                    span={1}
                                    isStart
                                    isEnd
                                    isWeekStart={false}
                                    isHovered={hoveredEventId === event.id}
                                    onHover={onHover}
                                    onClick={onEventClick}
                                    viewType={viewType}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
