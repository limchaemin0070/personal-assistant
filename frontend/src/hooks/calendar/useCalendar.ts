import { useCallback, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO, isValid, addMonths, subMonths } from 'date-fns';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';

export type CalendarView = 'month' | 'week' | 'day';

export const useCalendar = () => {
    const { view: viewParam, date: dateParam } = useParams<{
        view: CalendarView;
        date: string;
    }>();
    const navigate = useNavigate();

    // URL에서 view와 date를 읽어오기
    const view = (viewParam as CalendarView) || 'month';

    const currentDate = useMemo(() => {
        if (!dateParam) return new Date();
        const parsed = parseISO(dateParam);
        return isValid(parsed) ? parsed : new Date();
    }, [dateParam]);

    // 사용자가 선택한 날짜
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // URL 업데이트 함수
    const updateURL = useCallback(
        (newView: CalendarView, newDate: Date) => {
            const dateStr = format(newDate, 'yyyy-MM-dd');
            navigate(`/calendar/${newView}/${dateStr}`, { replace: true });
        },
        [navigate],
    );

    // 월간 날짜 데이터
    const monthDays = useMemo(() => {
        return CalendarUtils.generateMonthDays(currentDate);
    }, [currentDate]);

    // 상단에 표시되는 헤더 텍스트
    const headerText = useMemo(() => {
        switch (view) {
            // case 'week':
            //     return CalendarUtils.getWeekRangeText(currentDate);
            // case 'day':
            //     return CalendarUtils.getDayText(currentDate);
            // case 'month':
            default:
                return CalendarUtils.getMonthYearText(currentDate);
        }
    }, [view, currentDate]);

    // 날짜 셀을 클릭하면 일간 뷰
    const switchToDayView = useCallback(() => {
        updateURL(view, addMonths(currentDate, 1));
    }, [view, currentDate, updateURL]);

    // 월간 네비게이션
    const goToNextMonth = useCallback(() => {
        updateURL(view, addMonths(currentDate, 1));
    }, [view, currentDate, updateURL]);

    const goToPrevMonth = useCallback(() => {
        updateURL(view, subMonths(currentDate, 1));
    }, [view, currentDate, updateURL]);

    // 주간 뷰 네비게이션
    const goToNextWeek = useCallback(() => {
        updateURL(view, CalendarUtils.getNextWeek(currentDate));
    }, [view, currentDate, updateURL]);

    const goToPrevWeek = useCallback(() => {
        updateURL(view, CalendarUtils.getPrevWeek(currentDate));
    }, [view, currentDate, updateURL]);

    // 일간 뷰 네비게이션
    const goToNextDay = useCallback(() => {
        updateURL(view, CalendarUtils.getNextDay(currentDate));
    }, [view, currentDate, updateURL]);

    const goToPrevDay = useCallback(() => {
        updateURL(view, CalendarUtils.getPrevDay(currentDate));
    }, [view, currentDate, updateURL]);

    // 오늘로 이동
    const goToToday = useCallback(() => {
        updateURL(view, new Date());
    }, [view, updateURL]);

    // 뷰 변경
    const setView = useCallback(
        (newView: CalendarView) => {
            updateURL(newView, currentDate);
        },
        [currentDate, updateURL],
    );

    // 날짜 선택 시 일간 뷰로 전환 (더블클릭)
    const handleDateSelect = useCallback(
        (date: Date) => {
            setSelectedDate(date);
            updateURL('day', date);
        },
        [updateURL],
    );

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
