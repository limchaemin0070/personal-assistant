interface CalendarWeekProps {
    weekDays: CalendarDay[];
    weekLayout: Map<string, EventWithLane[]>;
    maxVisibleEvents?: number;
}

// 캘린더의 한 주차 컴포넌트
// 1 row
export const CalendarWeek = () => {
    return (
        <div>
            {/* 주차별로 렌더링 */}
            {weekDays.map((day) => {
                return (
                    <div>
                        {/* 일자별 렌더링 */}
                        <div>날짜(숫자)</div>
                        <div>이벤트 목록 렌더링(map 이용)</div>
                    </div>
                );
            })}
        </div>
    );
};
