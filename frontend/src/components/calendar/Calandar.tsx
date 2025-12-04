import React from 'react';
import { CalendarWeek } from './CalendarWeek';

// 전체 캘린더 뷰
export const Calander: React.FC = () => {
    // 구현중
    const { weeks, currentDate } = useCalendar();

    return (
        <div className="flex h-full w-full items-center justify-center bg-white">
            <div className="text-center text-gray-500">
                {/* 캘린더 제목 */}
                <h3>
                    {headers.current.year} {headers.current.month + 1}
                </h3>
                {/* 캘린더 월 변경 컨트롤러 */}
                <div>
                    <button type="button" onClick={movePrevMonth}>
                        이전 달
                    </button>
                    <button type="button" onClick={moveNextMonth}>
                        다음 달
                    </button>
                </div>
                {/* 요일 레인*/}
                <WeekdayHeaders />
                {weeks.map((weekDays) => {
                    return (
                        <CalendarWeek
                            weekDays={weekDays}
                            weekLayout={weekLayout}
                            maxVisibleEvents={4}
                        />
                    );
                })}
            </div>
        </div>
    );
};
