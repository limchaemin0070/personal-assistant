import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    format,
    parseISO,
    isValid,
    startOfMonth,
    addMonths,
    subMonths,
} from 'date-fns';
import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';
import { Sidebar } from '@/components/common/Sidebar';
import { CalendarGrid } from './CalendarGrid';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import { cn } from '@/utils/cn';
import type { CalendarView } from '@/hooks/calendar/useCalendar';

interface CalendarSidebarProps {
    // eslint-disable-next-line react/require-default-props
    onClose?: () => void;
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
    onClose,
}) => {
    const { view: viewParam, date: dateParam } = useParams<{
        view: CalendarView;
        date: string;
    }>();
    const navigate = useNavigate();

    const view = (viewParam as CalendarView) || 'month';

    const currentDate = useMemo(() => {
        if (!dateParam) return new Date();
        const parsed = parseISO(dateParam);
        return isValid(parsed) ? parsed : new Date();
    }, [dateParam]);

    // 미니 캘린더의 월을 독립적으로 관리
    const [miniCalendarMonth, setMiniCalendarMonth] = useState(() =>
        startOfMonth(currentDate),
    );

    // 메인 캘린더의 날짜가 변경되면 미니 캘린더도 해당 월로 동기화
    useEffect(() => {
        const mainMonth = startOfMonth(currentDate);
        setMiniCalendarMonth(mainMonth);
    }, [currentDate]);

    // 날짜 클릭 핸들러 - 메인 캘린더의 날짜만 변경
    const handleDateClick = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        navigate(`/calendar/${view}/${dateStr}`, { replace: true });
    };

    // 이전 월로 이동 - 미니 캘린더만 변경
    const handlePrevMonth = () => {
        setMiniCalendarMonth((prev) => subMonths(prev, 1));
    };

    // 다음 월로 이동 - 미니 캘린더만 변경
    const handleNextMonth = () => {
        setMiniCalendarMonth((prev) => addMonths(prev, 1));
    };

    return (
        <Sidebar
            title=""
            width="md"
            borderPosition="right"
            onClose={onClose}
            showCloseButton={false}
        >
            <div className="flex flex-col">
                <div className="shrink-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <button
                            type="button"
                            className="btn-icon-sm"
                            onClick={handlePrevMonth}
                            aria-label="이전 월"
                        >
                            <SlArrowLeft />
                        </button>
                        <h3 className="text-sm font-semibold text-gray-700 flex-1 text-center">
                            {CalendarUtils.getMonthYearText(miniCalendarMonth)}
                        </h3>
                        <button
                            type="button"
                            className="btn-icon-sm"
                            onClick={handleNextMonth}
                            aria-label="다음 월"
                        >
                            <SlArrowRight />
                        </button>
                    </div>
                </div>
                <div className="shrink-0">
                    <CalendarGrid
                        month={miniCalendarMonth}
                        renderDay={(day) => {
                            const dayDateKey = CalendarUtils.getDateKey(
                                day.date,
                            );
                            const currentDateKey =
                                CalendarUtils.getDateKey(currentDate);
                            const isSelected = dayDateKey === currentDateKey;

                            return (
                                <button
                                    type="button"
                                    onClick={() => handleDateClick(day.date)}
                                    className={cn(
                                        'w-full h-full min-h-[32px] flex items-center justify-center text-xs transition-colors',
                                        'hover:bg-gray-300 active:bg-blue-100 rounded-xs',
                                        !day.isCurrentMonth &&
                                            'text-gray-400 opacity-50',
                                        day.isToday &&
                                            'font-bold text-blue-600',
                                        isSelected &&
                                            'bg-blue-100 text-blue-700 font-semibold rounded',
                                    )}
                                >
                                    {day.dayOfMonth}
                                </button>
                            );
                        }}
                        className="max-h-[280px]"
                    />
                </div>
            </div>
        </Sidebar>
    );
};
