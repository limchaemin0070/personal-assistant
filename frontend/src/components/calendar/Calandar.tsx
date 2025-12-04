import React from 'react';
import { CalendarWeek } from './CalendarWeek';
import { useCalendar } from '@/hooks/calendar/useCalendar';
import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';

// 전체 캘린더 뷰
export const Calander: React.FC = () => {
    const {
        currentDate,
        view,

        weekDays,
        headerText,

        goToNextMonth,
        goToPrevMonth,
    } = useCalendar();

    return (
        <div className="flex flex-col flex-1 h-full w-full bg-white">
            <div className="flex flex-row align-middle gap-5">
                {/* 캘린더 제목 */}
                <h3 className="text-2xl font-semibold">{headerText}</h3>
                {/* 캘린더 월 변경 컨트롤러 */}
                <div className="flex flex-row gap-2">
                    <button
                        className="p-2"
                        type="button"
                        onClick={goToPrevMonth}
                    >
                        <SlArrowLeft />
                    </button>
                    <button
                        className="p-2"
                        type="button"
                        onClick={goToNextMonth}
                    >
                        <SlArrowRight />
                    </button>
                </div>
            </div>
            {/* 요일 레인 */}
            {weekDays.map((week) => {
                return (
                    <CalendarWeek
                        weekDays={week}
                        // weekLayout={weekLayout}
                        // maxVisibleEvents={4}
                    />
                );
            })}
        </div>
    );
};
