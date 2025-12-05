import type { CalendarDay } from '@/utils/calendar/CalendarUtils';
import { MonthEventTicket } from '../event/MonthEventTicket';
import { addDays } from 'date-fns';

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
                            <MonthEventTicket
                                id="1"
                                title="샘플 이벤트"
                                categoryColor="#3b82f6"
                                startDate={new Date(2024, 11, 5)}
                                endDate={addDays(new Date(2024, 11, 5), 2)}
                                row={0}
                                span={3}
                                isStart
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
