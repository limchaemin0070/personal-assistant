import React from 'react';
import { IoMdAlarm } from 'react-icons/io';
import { CalendarMonthView } from './CalendarMonthView';
import { CalendarDayView } from './CalendarDayView';
import { CalendarWeekView } from './CalendarWeekView';
import { CalendarHeader } from './CalendarHeader';
import { useCalendar } from '@/hooks/calendar/useCalendar';

interface CalendarMainProps {
    // eslint-disable-next-line react/require-default-props
    onToggleLeftSidebar?: () => void;
    // eslint-disable-next-line react/require-default-props
    onToggleRightSidebar?: () => void;
}

export const CalendarMain: React.FC<CalendarMainProps> = ({
    onToggleLeftSidebar,
    onToggleRightSidebar,
}) => {
    const {
        currentDate,
        view,
        setView,
        selectedDate,
        setSelectedDate,
        monthDays,
        headerText,
        handleDateSelect,
        handlePrev,
        handleNext,
    } = useCalendar();

    // TODO : 주간 뷰는 일간 뷰를 7일로 반복해서 구성
    const renderCalendarView = () => {
        switch (view) {
            case 'month':
                return (
                    <CalendarMonthView
                        currentDate={currentDate}
                        monthDays={monthDays}
                        onDateSelect={handleDateSelect}
                    />
                );
            case 'week':
                return (
                    <CalendarWeekView
                        currentDate={currentDate}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                    />
                );
            case 'day':
                return (
                    <CalendarDayView
                        currentDate={currentDate}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                    />
                );
            default:
                return (
                    <CalendarMonthView
                        currentDate={currentDate}
                        monthDays={monthDays}
                        onDateSelect={handleDateSelect}
                    />
                );
        }
    };

    return (
        <main className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center gap-2 bg-white px-4 py-3">
                {onToggleLeftSidebar && (
                    <button
                        type="button"
                        onClick={onToggleLeftSidebar}
                        className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
                    >
                        ☰
                    </button>
                )}
                {/* 캘린더 헤더 */}
                <CalendarHeader
                    headerText={headerText}
                    onPrevMonth={handlePrev}
                    onNextMonth={handleNext}
                    setView={setView}
                />
                {onToggleRightSidebar && (
                    <button
                        type="button"
                        onClick={onToggleRightSidebar}
                        className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
                    >
                        <IoMdAlarm />
                    </button>
                )}
            </div>
            <div className="flex flex-1">{renderCalendarView()}</div>
        </main>
    );
};
