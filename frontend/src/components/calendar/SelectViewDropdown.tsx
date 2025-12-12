import React from 'react';
import { cn } from '@/utils/cn';
import type { CalendarView } from '@/hooks/calendar/useCalendar';

interface SelectViewDropdownProps {
    view: CalendarView;
    setView: (view: CalendarView) => void;
}

// 공통 버튼 스타일
const viewButtonBaseStyles =
    'px-2 py-1 text-sm rounded transition-colors duration-200 cursor-pointer';

// 선택된 뷰 버튼 스타일
const viewButtonActiveStyles = 'bg-gray-200 font-medium text-gray-900';

// 비선택된 뷰 버튼 스타일
const viewButtonInactiveStyles = 'hover:bg-gray-100 text-gray-600';

export const SelectViewDropdown: React.FC<SelectViewDropdownProps> = ({
    view,
    setView,
}) => {
    const views: { value: CalendarView; label: string }[] = [
        { value: 'month', label: '월' },
        { value: 'week', label: '주' },
        { value: 'day', label: '일' },
    ];

    return (
        <div className="flex gap-0.5">
            {views.map((viewOption) => {
                const isActive = view === viewOption.value;
                return (
                    <button
                        key={viewOption.value}
                        type="button"
                        onClick={() => setView(viewOption.value)}
                        className={cn(
                            viewButtonBaseStyles,
                            isActive
                                ? viewButtonActiveStyles
                                : viewButtonInactiveStyles,
                        )}
                    >
                        {viewOption.label}
                    </button>
                );
            })}
        </div>
    );
};
