import React from 'react';
import { CalendarWeek } from './CalendarWeek';
import { useCalendar } from '@/hooks/calendar/useCalendar';

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
        <div className="flex h-full w-full items-center justify-center bg-white">
            <div className="text-center text-gray-500">
                {/* 캘린더 제목 */}
                <h3>{headerText}</h3>
                {/* 캘린더 월 변경 컨트롤러 */}
                <div>
                    <button type="button" onClick={goToPrevMonth}>
                        이전 달
                    </button>
                    <button type="button" onClick={goToNextMonth}>
                        다음 달
                    </button>
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
        </div>
    );
};
