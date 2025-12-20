import React from 'react';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { useCalendarLayout } from '@/hooks/calendar/useCalendarLayout';
import type { useEventTicketHandling } from '@/hooks/event/useEventTicketHandling';
import { useDelayedLoading } from '@/hooks/useDelayedLoading';
import { CalendarModal } from './CalendarModal';
import { DayColumn } from './DayColumn';

interface CalendarDayViewProps {
    currentDate: Date;
    selectedDate: Date | null;
    setSelectedDate: (date: Date | null) => void;
    modalHandlers: ReturnType<typeof useEventTicketHandling>;
}

export const CalendarDayView: React.FC<CalendarDayViewProps> = ({
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

    const dayEvents = React.useMemo(() => {
        return calculateDayLayout(allEvents, currentDate);
    }, [allEvents, currentDate, calculateDayLayout]);

    return (
        <div className="relative flex flex-col flex-1 min-h-0 w-full bg-white">
            <DayColumn
                date={currentDate}
                events={dayEvents}
                isLoading={showSpinner}
                viewType="day"
                hoveredEventId={modalHandlers.hoveredEventId}
                onHover={modalHandlers.handleHover}
                onEventClick={modalHandlers.handleEventClick}
            />
            <CalendarModal
                currentDate={currentDate}
                events={allEvents}
                modalHandlers={modalHandlers}
            />
        </div>
    );
};
