import React, { useMemo, useState } from 'react';
import { addDays } from 'date-fns';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { useCalendarLayout } from '@/hooks/calendar/useCalendarLayout';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import { useEventTicketHandling } from '@/hooks/event/useEventTicketHandling';
import { AddButton } from '../common/Button/AddButton';
import { useDelayedLoading } from '@/hooks/useDelayedLoading';
import { CalendarModal } from './CalendarModal';
import { DayColumn } from './DayColumn';

interface CalendarWeekViewProps {
    currentDate: Date;
    selectedDate: Date | null;
    setSelectedDate: (date: Date | null) => void;
}

export const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
    currentDate,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedDate: _selectedDate,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setSelectedDate: _setSelectedDate,
}) => {
    const { allEvents, isLoading } = useCalendarEvents(currentDate, 'week');
    const showSpinner = useDelayedLoading(isLoading);
    const { calculateDayLayout } = useCalendarLayout();
    const modalHandlers = useEventTicketHandling();

    // 주간 뷰에서는 이벤트 ID와 날짜 키를 조합한 고유 키로 호버 상태 관리
    const [hoveredEventKey, setHoveredEventKey] = useState<string | null>(null);

    const handleHover = (eventId: number | null, dateKey: string) => {
        if (eventId === null) {
            setHoveredEventKey(null);
        } else {
            setHoveredEventKey(`${eventId}-${dateKey}`);
        }
    };

    const { handleEventClick, handleAdd } = modalHandlers;

    // 주의 시작일(일요일)부터 7일 계산
    const weekDays = useMemo(() => {
        const weekStart = CalendarUtils.getWeekStart(currentDate);
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }, [currentDate]);

    // 각 날짜별 이벤트를 미리 계산
    const dayEventsMap = useMemo(() => {
        const map = new Map<string, ReturnType<typeof calculateDayLayout>>();
        weekDays.forEach((dayDate) => {
            const dateKey = CalendarUtils.getDateKey(dayDate);
            const events = calculateDayLayout(allEvents, dayDate);
            map.set(dateKey, events);
        });
        return map;
    }, [weekDays, allEvents, calculateDayLayout]);

    return (
        <div className="relative flex flex-1 h-full w-full bg-white">
            <div className="flex flex-1 overflow-x-auto">
                {weekDays.map((dayDate) => {
                    const dateKey = CalendarUtils.getDateKey(dayDate);
                    const dayEvents = dayEventsMap.get(dateKey) || [];

                    return (
                        <DayColumn
                            key={dateKey}
                            date={dayDate}
                            events={dayEvents}
                            isLoading={showSpinner}
                            viewType="week"
                            hoveredEventKey={hoveredEventKey}
                            onHover={(eventId) => handleHover(eventId, dateKey)}
                            onEventClick={handleEventClick}
                            className="border-r border-gray-200 last:border-r-0"
                        />
                    );
                })}
            </div>
            <AddButton
                onClick={handleAdd}
                className="absolute bottom-6 right-6 z-50"
                variant="fab"
                size="md"
            />
            <CalendarModal
                currentDate={currentDate}
                events={allEvents}
                modalHandlers={modalHandlers}
            />
        </div>
    );
};
