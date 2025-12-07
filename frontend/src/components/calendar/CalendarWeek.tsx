import type { CalendarDay } from '@/utils/calendar/CalendarUtils';
import { MonthEventTicket } from '../event/MonthEventTicket';
import type { EventLayout } from '@/hooks/calendar/useCalendarLayout';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';

interface CalendarWeekProps {
    weekDays: CalendarDay[];
    eventsLayout: Map<string, EventLayout[]>;
    hoveredEventId: string | null;
    onHover: (eventId: string | null) => void;
}

// 캘린더의 한 주차 컴포넌트
export const CalendarWeek = ({
    weekDays,
    eventsLayout,
    hoveredEventId,
    onHover,
}: CalendarWeekProps) => {
    return (
        <div className="calendar-week-container">
            {/* 주차별로 렌더링 */}
            {weekDays.map((day, index) => {
                const isWeekend = index === 0 || index === 6; // 일요일(0) 또는 토요일(6)
                const dateKey = CalendarUtils.getDateKey(day.date);
                const dayEvents = eventsLayout.get(dateKey) || [];

                return (
                    // 주말은 칸 색을 다르게
                    <div
                        key={dateKey}
                        className={`calendar-day-cell ${
                            isWeekend ? 'calendar-day-cell-weekend' : ''
                        }`}
                    >
                        {/* 현재 달이 아닌 채워진 날짜들은 흐리게 */}
                        <div
                            className={`calendar-day-number ${
                                !day.isCurrentMonth
                                    ? 'calendar-day-number-other-month'
                                    : ''
                            }`}
                        >
                            {day.dayOfMonth}
                        </div>
                        {/* 이벤트(일정-schedule) 날짜별로 그리드 배치 */}
                        <div className="calendar-events-grid">
                            {dayEvents.map((eventLayout) => (
                                <MonthEventTicket
                                    key={`${eventLayout.event.id}-${dateKey}`}
                                    id={String(eventLayout.event.id)}
                                    title={eventLayout.event.title}
                                    categoryColor={
                                        eventLayout.event.categoryColor ||
                                        '#3b82f6'
                                    }
                                    startDate={eventLayout.event.startDate}
                                    endDate={eventLayout.event.endDate}
                                    row={eventLayout.row}
                                    span={eventLayout.span}
                                    isStart={eventLayout.isStart}
                                    isEnd={eventLayout.isEnd}
                                    isWeekStart={eventLayout.isWeekStart}
                                    isHovered={
                                        hoveredEventId ===
                                        String(eventLayout.event.id)
                                    }
                                    onHover={onHover}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
