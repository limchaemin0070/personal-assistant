import React from 'react';
import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';
import type { CalendarView } from '@/hooks/calendar/useCalendar';
import {
    ButtonGroup,
    type ButtonGroupOption,
} from '@/components/common/ButtonGroup';

interface CalendarHeaderProps {
    headerText: string;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
    view: CalendarView;
    setView: (view: CalendarView) => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    headerText,
    onPrevMonth,
    onNextMonth,
    onToday,
    view,
    setView,
}: CalendarHeaderProps) => {
    const views: ButtonGroupOption<CalendarView>[] = [
        { value: 'month', label: '월' },
        { value: 'week', label: '주' },
        { value: 'day', label: '일' },
    ];

    return (
        <div className="flex flex-row items-center justify-between w-full gap-5">
            <div className="flex flex-row items-center gap-5">
                <div className="flex flex-row gap-2">
                    <button
                        className="btn-icon"
                        type="button"
                        onClick={onPrevMonth}
                    >
                        <SlArrowLeft />
                    </button>
                    <button
                        className="btn-icon"
                        type="button"
                        onClick={onNextMonth}
                    >
                        <SlArrowRight />
                    </button>
                </div>
                <h3 className="text-2xl font-semibold">{headerText}</h3>
                <button
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    type="button"
                    onClick={onToday}
                >
                    Today
                </button>
            </div>
            <div className="flex flex-row items-center gap-3">
                <ButtonGroup
                    options={views}
                    value={view}
                    onChange={(newView) => setView(newView as CalendarView)}
                    multiple={false}
                />
            </div>
        </div>
    );
};
