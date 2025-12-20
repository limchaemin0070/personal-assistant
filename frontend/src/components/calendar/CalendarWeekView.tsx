import React, { useMemo } from 'react';
import { addDays } from 'date-fns';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { useCalendarLayout } from '@/hooks/calendar/useCalendarLayout';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import type { useEventTicketHandling } from '@/hooks/event/useEventTicketHandling';
import { MonthEventTicket } from '../event/MonthEventTicket';
import { Loading } from '../common/Loading';
import { useDelayedLoading } from '@/hooks/useDelayedLoading';
import { CalendarModal } from './CalendarModal';

interface CalendarWeekViewProps {
    currentDate: Date;
    selectedDate: Date | null;
    setSelectedDate: (date: Date | null) => void;
    modalHandlers: ReturnType<typeof useEventTicketHandling>;
}

export const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
    currentDate,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedDate: _selectedDate,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setSelectedDate: _setSelectedDate,
    modalHandlers,
}) => {
    const { allEvents, isLoading } = useCalendarEvents(currentDate);
    const showSpinner = useDelayedLoading(isLoading);
    const { calculateDayLayout } = useCalendarLayout();

    const { hoveredEventId, handleHover, handleEventClick } = modalHandlers;

    // 주의 시작일(일요일)부터 7일 계산
    const weekDays = useMemo(() => {
        const weekStart = CalendarUtils.getWeekStart(currentDate);
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }, [currentDate]);

    const renderDayColumn = (dayDate: Date) => {
        const dayEvents = calculateDayLayout(allEvents, dayDate);
        const dateKey = CalendarUtils.getDateKey(dayDate);

        return (
            <div
                key={dateKey}
                className="flex flex-col border-r border-gray-200 last:border-r-0 flex-1 min-w-0"
            >
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <div className="text-sm font-semibold text-gray-600">
                        {CalendarUtils.formatDayOfWeek(dayDate, true)}
                    </div>
                    <div className="text-xl font-bold">{dayDate.getDate()}</div>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                    {showSpinner ? (
                        <div className="flex items-center justify-center p-4">
                            <Loading size="md" color="blue" />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {dayEvents.map((event) => (
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
                                    onHover={handleHover}
                                    onClick={handleEventClick}
                                    viewType="week"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="relative flex flex-1 h-full w-full bg-white">
            <div className="flex flex-1 overflow-x-auto">
                {weekDays.map((dayDate) => renderDayColumn(dayDate))}
            </div>
            <CalendarModal
                currentDate={currentDate}
                events={allEvents}
                modalHandlers={modalHandlers}
            />
        </div>
    );
};
