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
    const monthDays = useMemo(() => {
        return CalendarUtils.getMonthGrid(currentDate);
    }, [currentDate]);

    // 상단에 표시되는 헤더 텍스트 (월간 헤더 텍스트만 표시)
    const headerText = useMemo(() => {
        return CalendarUtils.getMonthYearText(currentDate);
    }, [currentDate]);

    // 날짜 셀을 클릭하면 일간 뷰
    const switchToDayView = useCallback(() => {
        setCurrentDate((prev) => addMonths(prev, 1));
    }, []);

    // 월간 네비게이션
    const goToNextMonth = useCallback(() => {
        setCurrentDate((prev) => addMonths(prev, 1));
    }, []);

    const goToPrevMonth = useCallback(() => {
        setCurrentDate((prev) => subMonths(prev, 1));
    }, []);

    // 주간 뷰 네비게이션
    const goToNextWeek = useCallback(() => {
        setCurrentDate((prev) => CalendarUtils.getNextWeek(prev));
    }, []);

    const goToPrevWeek = useCallback(() => {
        setCurrentDate((prev) => CalendarUtils.getPrevWeek(prev));
    }, []);

    // 일간 뷰 네비게이션
    const goToNextDay = useCallback(() => {
        setCurrentDate((prev) => CalendarUtils.getNextDay(prev));
    }, []);

    const goToPrevDay = useCallback(() => {
        setCurrentDate((prev) => CalendarUtils.getPrevDay(prev));
    }, []);

    // 오늘로 이동
    const goToToday = useCallback(() => {
        setCurrentDate(new Date());
    }, []);

    // 날짜 선택 시 일간 뷰로 전환 (더블클릭)
    const handleDateSelect = useCallback((date: Date) => {
        setSelectedDate(date);
        setCurrentDate(date);
        setView('day');
    }, []);

    // 날짜 포커스만 설정 (단일 클릭)
    const handleDateFocus = useCallback((date: Date) => {
        setSelectedDate(date);
    }, []);

    const handlePrev = useCallback(() => {
        switch (view) {
            case 'week':
                goToPrevWeek();
                break;
            case 'day':
                goToPrevDay();
                break;
            case 'month':
            default:
                goToPrevMonth();
                break;
        }
    }, [view, goToPrevWeek, goToPrevDay, goToPrevMonth]);

    const handleNext = useCallback(() => {
        switch (view) {
            case 'week':
                goToNextWeek();
                break;
            case 'day':
                goToNextDay();
                break;
            case 'month':
            default:
                goToNextMonth();
                break;
        }
    }, [view, goToNextWeek, goToNextDay, goToNextMonth]);

    return {
        currentDate,
        view,
        setView,
        selectedDate,
        setSelectedDate,
        monthDays,
        headerText,
        switchToDayView,
        goToNextMonth,
        goToPrevMonth,
        goToNextWeek,
        goToPrevWeek,
        goToNextDay,
        goToPrevDay,
        goToToday,
        handleDateSelect,
        handleDateFocus,
        handlePrev,
        handleNext,
    };
};
