import type { CalendarDay } from '@/utils/calendar/CalendarUtils';

interface CalendarWeekProps {
    weekDays: CalendarDay[];
    // weekLayout: Map<string, EventWithLane[]>;
    // maxVisibleEvents?: number;
}

// 캘린더의 한 주차 컴포넌트
// 1 row
export const CalendarWeek = ({
    weekDays,
    // weekLayout,
    // maxVisibleEvents,
}: CalendarWeekProps) => {
    return (
        <div className="calendar-week-container">
            {/* 주차별로 렌더링 */}
            {weekDays.map((day, index) => {
                const isWeekend = index === 0 || index === 6; // 일요일(0) 또는 토요일(6)
                return (
                    <div
                        className={`calendar-day-cell ${
                            isWeekend ? 'calendar-day-cell-weekend' : ''
                        }`}
                    >
                        {/* 일자별 렌더링 */}
                        <div
                            className={`calendar-day-number ${
                                !day.isCurrentMonth
                                    ? 'calendar-day-number-other-month'
                                    : ''
                            }`}
                        >
                            {day.dayOfMonth}
                        </div>
                        <div className="calendar-events-grid">
                            {/* 이후 여기에 이벤트들을 최대 4개까지 렌더링 */}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
