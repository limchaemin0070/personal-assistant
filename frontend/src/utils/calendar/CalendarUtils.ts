import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    format,
    addMonths,
    subMonths,
    isSameDay,
    startOfDay,
    endOfDay,
} from 'date-fns';
import { ko } from 'date-fns/locale';

export interface CalendarDay {
    date: Date;
    dayOfMonth: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isPast: boolean;
}

export class CalendarUtils {
    /**
     * 캘린더 그리드용 날짜 배열 생성 (6주 * 7일 = 42칸)
     */
    static getMonthGrid(date: Date): CalendarDay[] {
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);

        // 캘린더 시작 - 일요일 (weekStartsOn : 0)
        const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
        const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

        const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
        const today = new Date();

        return days.map((day) => ({
            date: day,
            dayOfMonth: day.getDate(),
            isCurrentMonth: isSameMonth(day, date),
            isToday: isToday(day),
            isPast: day < startOfDay(today),
        }));
    }

    /**
     * 주 단위 그룹화
     *   [day1, day2, day3, day4, day5, day6, day7],     // 1주차
     *   [day8, day9, day10, day11, day12, day13, day14], // 2주차
     */
    static groupByWeeks(days: CalendarDay[]): CalendarDay[][] {
        const weeks: CalendarDay[][] = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }
        return weeks;
    }

    /**
     * 날짜 키 생성 (이벤트 인덱싱용)
     */
    static getDateKey(date: Date): string {
        return format(date, 'yyyy-MM-dd');
    }

    /**
     * 두 날짜 사이의 모든 날짜
     */
    static getDateRange(start: Date, end: Date): Date[] {
        return eachDayOfInterval({
            start: startOfDay(start),
            end: startOfDay(end),
        });
    }

    /**
     * 이벤트가 특정 날짜에 표시되어야 하는지
     */
    static isEventOnDate(
        eventStart: Date,
        eventEnd: Date,
        targetDate: Date,
    ): boolean {
        const target = startOfDay(targetDate);
        // 시작일 <= 타겟 <= 끝나는 날짜
        return (
            target >= startOfDay(eventStart) && target <= startOfDay(eventEnd)
        );
    }

    /**
     * 한글 포맷팅
     */
    static formatKorean(date: Date, formatStr: string): string {
        return format(date, formatStr, { locale: ko });
    }

    /**
     * 월 헤더 텍스트 만들기
     */
    static getMonthYearText(date: Date): string {
        return this.formatKorean(date, 'yyyy년 M월');
    }
}
