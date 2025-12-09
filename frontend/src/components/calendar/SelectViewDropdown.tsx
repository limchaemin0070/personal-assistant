import React from 'react';
import type { CalendarView } from '@/hooks/calendar/useCalendar';

interface SelectViewDropdownProps {
    setView: (view: CalendarView) => void;
}

// TODO : 추후 드롭다운이나 토글 형태로 변경
export const SelectViewDropdown: React.FC<SelectViewDropdownProps> = ({
    setView,
}) => {
    return (
        <div className="flex gap-0.5">
            <button
                type="button"
                onClick={() => setView('month')}
                className="px-2 py-1 text-sm rounded hover:bg-gray-100"
            >
                월
            </button>
            <button
                type="button"
                onClick={() => setView('week')}
                className="px-2 py-1 text-sm rounded hover:bg-gray-100"
            >
                주
            </button>
            <button
                type="button"
                onClick={() => setView('day')}
                className="px-2 py-1 text-sm rounded hover:bg-gray-100"
            >
                일
            </button>
        </div>
    );
};
