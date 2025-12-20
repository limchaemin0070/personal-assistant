import React from 'react';
import type { CalendarDay } from '@/types';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import { cn } from '@/utils/cn';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarGridProps {
    month: Date;
    renderDay: (day: CalendarDay) => React.ReactNode;
    className?: string;
}

/**
 * 순수하게 캘린더 UI만 그림
 * @param param0
 * @returns
 */
export const CalendarGrid: React.FC<CalendarGridProps> = ({
    month,
    renderDay,
    className,
}) => {
    const monthDays = React.useMemo(
        () => CalendarUtils.generateMonthDays(month),
        [month],
    );

    return (
        <div className={cn('flex flex-col h-full w-full', className)}>
            <div className="calendar-grid-header">
                {weekDays.map((day) => (
                    <div key={day} className="calendar-weekday-header">
                        {day}
                    </div>
                ))}
            </div>
            <div className="calendar-grid">
                {monthDays.map((day) => renderDay(day))}
            </div>
        </div>
    );
};
