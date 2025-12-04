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
        <div>
            {/* 주차별로 렌더링 */}
            {weekDays.map((day) => {
                return (
                    <div>
                        {/* 일자별 렌더링 */}
                        <div>{day.dayOfMonth}</div>
                        {/* <div>{maxVisibleEvents}</div> */}
                    </div>
                );
            })}
        </div>
    );
};
