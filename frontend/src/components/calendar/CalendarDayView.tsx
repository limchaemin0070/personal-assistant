import React from 'react';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { useCalendarLayout } from '@/hooks/calendar/useCalendarLayout';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import type { useEventTicketHandling } from '@/hooks/event/useEventTicketHandling';
import { MonthEventTicket } from '../event/MonthEventTicket';
import { Loading } from '../common/Loading';
import { useDelayedLoading } from '@/hooks/useDelayedLoading';
import { CalendarModal } from './CalendarModal';

interface CalendarDayViewProps {
    currentDate: Date;
    selectedDate: Date | null;
    setSelectedDate: (date: Date | null) => void;
    modalHandlers: ReturnType<typeof useEventTicketHandling>;
}

export const CalendarDayView: React.FC<CalendarDayViewProps> = ({
    currentDate,
    selectedDate,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setSelectedDate: _setSelectedDate,
    modalHandlers,
}) => {
    const { allEvents, isLoading } = useCalendarEvents(currentDate);
    const showSpinner = useDelayedLoading(isLoading);
    const { calculateDayLayout } = useCalendarLayout();

    const displayDate = selectedDate || currentDate;

    const dayEvents = React.useMemo(() => {
        return calculateDayLayout(allEvents, displayDate);
    }, [allEvents, displayDate, calculateDayLayout]);

    const renderEventList = () => {
        if (showSpinner) {
            return (
                <div className="flex items-center justify-center p-8">
                    <Loading size="lg" color="blue" />
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-3 p-5">
                <div className="flex items-end gap-2">
                    <div className="font-bold text-4xl">
                        {displayDate.getDate()}
                    </div>
                    <div className="font-bold text-lg text-gray-600">
                        {CalendarUtils.formatDayOfWeek(displayDate)}
                    </div>
                </div>
                <div className="border-t border-gray-300" />
                <div className="flex flex-col">
                    {dayEvents.map((event) => (
                        <MonthEventTicket
                            key={`${event.id}-${CalendarUtils.getDateKey(displayDate)}`}
                            id={event.id}
                            title={event.title}
                            categoryColor={event.categoryColor || '#3b82f6'}
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
                            isHovered={
                                modalHandlers.hoveredEventId === event.id
                            }
                            onHover={modalHandlers.handleHover}
                            onClick={modalHandlers.handleEventClick}
                            viewType="day"
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="relative flex flex-col flex-1 h-full w-full bg-white">
            {renderEventList()}
            <CalendarModal
                currentDate={currentDate}
                events={allEvents}
                modalHandlers={modalHandlers}
            />
        </div>
    );
};
