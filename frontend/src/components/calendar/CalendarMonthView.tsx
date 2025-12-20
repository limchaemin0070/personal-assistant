import React from 'react';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { useCalendarLayout } from '@/hooks/calendar/useCalendarLayout';
import { AddButton } from '../common/Button/AddButton';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import { CalendarDayCell } from './CalendarDayCell';
import { useEventTicketHandling } from '@/hooks/event/useEventTicketHandling';
import type { CalendarDay } from '@/utils/calendar/CalendarUtils';
import { useDelayedLoading } from '@/hooks/useDelayedLoading';
import { Loading } from '../common/Loading';
import { CalendarModals } from './CalendarModal';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
interface CalendarMonthViewProps {
    currentDate: Date;
    monthDays: CalendarDay[];
    onDateSelect: (date: Date) => void;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
    currentDate,
    monthDays,
    onDateSelect,
}) => {
    const { monthEvents, isLoading } = useCalendarEvents(currentDate);
    const showSpinner = useDelayedLoading(isLoading);
    const { calculateMonthLayout } = useCalendarLayout();
    const modalHandlers = useEventTicketHandling();

    const eventsLayout = React.useMemo(() => {
        return calculateMonthLayout(monthEvents);
    }, [monthEvents, calculateMonthLayout]);

    const { hoveredEventId, handleHover, handleEventClick, handleAdd } =
        modalHandlers;

    const renderCalendarGrid = () => {
        if (showSpinner) {
            return (
                <div className="flex items-center justify-center p-8">
                    <Loading size="lg" color="blue" />
                </div>
            );
        }

        return (
            <div className="calendar-grid">
                {monthDays.map((day) => {
                    const dateKey = CalendarUtils.getDateKey(day.date);
                    const dayEvents = eventsLayout.get(dateKey) || [];

                    return (
                        <CalendarDayCell
                            key={dateKey}
                            day={day}
                            events={dayEvents}
                            hoveredEventId={hoveredEventId}
                            onHover={handleHover}
                            onEventClick={handleEventClick}
                            onDoubleClick={() => {
                                // eslint-disable-next-line no-console
                                console.log(
                                    '날짜 셀 더블클릭 (일간 뷰 이동):',
                                    day.date,
                                );
                                onDateSelect(day.date);
                            }}
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <div className="relative flex flex-col flex-1 h-full w-full bg-white">
            <div className="calendar-grid-header">
                {weekDays.map((day) => (
                    <div key={day} className="calendar-weekday-header">
                        {day}
                    </div>
                ))}
            </div>
            {/* 캘린더 그리드 */}
            {renderCalendarGrid()}
            <AddButton
                onClick={handleAdd}
                className="absolute bottom-6 right-6 z-50"
                variant="fab"
                size="md"
            />
            <CalendarModals
                currentDate={currentDate}
                events={monthEvents}
                modalHandlers={modalHandlers}
            />
        </div>
    );
};
