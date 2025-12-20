import { subMonths, format, addMonths, isSameDay } from 'date-fns';
import React from 'react';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import { CalendarGrid } from './CalendarGrid';

export const DateSelector: React.FC<{
    initialDate?: Date;
    onSelect: (date: Date) => void;
}> = ({ initialDate = new Date(), onSelect }) => {
    const [currentMonth, setCurrentMonth] = React.useState(initialDate);
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

    return (
        <div className="p-4 border rounded-lg shadow-lg bg-white">
            <div className="flex justify-between mb-2">
                <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                    ◀
                </button>
                <span>{format(currentMonth, 'yyyy년 M월')}</span>
                <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                    ▶
                </button>
            </div>

            <CalendarGrid
                month={currentMonth}
                renderDay={(day) => (
                    <button
                        key={CalendarUtils.getDateKey(day.date)}
                        className={`
                            p-2 hover:bg-blue-100 rounded
                            ${!day.isCurrentMonth ? 'text-gray-400' : ''}
                            ${
                                selectedDate &&
                                isSameDay(day.date, selectedDate)
                                    ? 'bg-blue-500 text-white'
                                    : ''
                            }
                        `}
                        onClick={() => {
                            setSelectedDate(day.date);
                            onSelect(day.date);
                        }}
                    >
                        {day.dayOfMonth}
                    </button>
                )}
            />
        </div>
    );
};
