import React from 'react';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { useCalendarLayout } from '@/hooks/calendar/useCalendarLayout';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import { CalendarDayCell } from './CalendarDayCell';
import type { useEventTicketHandling } from '@/hooks/event/useEventTicketHandling';
import { Loading } from '../common/Loading';
import { CalendarModal } from './CalendarModal';
import { CalendarGrid } from './CalendarGrid';

interface CalendarMonthViewProps {
    currentDate: Date;
    modalHandlers: ReturnType<typeof useEventTicketHandling>;
    onDateSelect: (date: Date) => void;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
    currentDate,
    modalHandlers,
    onDateSelect,
}) => {
    const { monthEvents, isLoading } = useCalendarEvents(currentDate);
    const { calculateMonthLayout } = useCalendarLayout();

    const eventsLayout = React.useMemo(
        () => calculateMonthLayout(monthEvents),
        [monthEvents, calculateMonthLayout],
    );

    if (isLoading) return <Loading />;

    return (
        <div className="relative flex flex-col flex-1 h-full w-full bg-white">
            <CalendarGrid
                month={currentDate}
                renderDay={(day) => {
                    const dateKey = CalendarUtils.getDateKey(day.date);
                    const dayEvents = eventsLayout.get(dateKey) || [];

                    return (
                        <CalendarDayCell
                            day={day}
                            events={dayEvents}
                            hoveredEventId={modalHandlers.hoveredEventId}
                            onHover={modalHandlers.handleHover}
                            onEventClick={modalHandlers.handleEventClick}
                            onDoubleClick={() => {
                                onDateSelect(day.date);
                            }}
                        />
                    );
                }}
            />
            <CalendarModal
                currentDate={currentDate}
                events={monthEvents}
                modalHandlers={modalHandlers}
            />
        </div>
    );
};
