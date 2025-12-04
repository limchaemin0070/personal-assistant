import { useCallback, useMemo, useState } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';

export type CalendarView = 'month' | 'week' | 'day';

interface UseCalendarOptions {
    initialDate?: Date;
    initialView?: CalendarView;
}

export const useCalendar = (options: UseCalendarOptions = {}) => {
    // 오늘 날짜
    const [currentDate, setCurrentDate] = useState(
        options.initialDate || new Date(),
    );

    // 캘린더 전체보기인지 주간/일간 자세히보기인지 관리하는 상태
    const [view, setView] = useState(options.initialView || 'month');

    // 사용자가 선택한 날짜
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // 월간 날짜 데이터
    // 직접 사용하지 않음
    const monthDays = useMemo(() => {
        return CalendarUtils.getMonthGrid(currentDate);
    }, [currentDate]);

    // 주간 날짜 데이터
    const weekDays = useMemo(() => {
        return CalendarUtils.groupByWeeks(monthDays);
    }, [monthDays]);

    // 상단에 표시되는 년.월
    // 2025.12
    const headerText = useMemo(() => {
        return CalendarUtils.getMonthYearText(currentDate);
    }, [currentDate]);

    // 네비게이션
    const goToNextMonth = useCallback(() => {
        setCurrentDate((prev) => addMonths(prev, 1));
    }, []);

    const goToPrevMonth = useCallback(() => {
        setCurrentDate((prev) => subMonths(prev, 1));
    }, []);

    return {
        currentDate,
        view,

        weekDays,
        headerText,

        goToNextMonth,
        goToPrevMonth,
    };
};
