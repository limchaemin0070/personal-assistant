import {
    startOfMonth,
    startOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    format,
    startOfDay,
    addDays,
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
     * 항상 6주로 고정되며, 빈 줄은 이전달/다음달 날짜로 채워집니다.
     */
    static getMonthGrid(date: Date): CalendarDay[] {
        const monthStart = startOfMonth(date);

        // 캘린더 시작 - 월의 첫 날이 속한 주의 일요일 (weekStartsOn : 0)
        const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });

        // 항상 6주(42일)로 고정
        const gridEnd = addDays(gridStart, 41); // 0일부터 41일까지 = 42일

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
     * 날짜를 YYYY-MM-DD 형식으로 포맷팅
     * 이벤트 인덱싱용 키 생성 및 HTML input type="date"용으로 사용
     * @example getDateKey(new Date(2024, 0, 1)) // "2024-01-01"
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
     * 이벤트가 며칠간 지속되는지
     */
    static getEventDuration(startDate: Date, endDate: Date): number {
        return this.getDateRange(startDate, endDate).length;
    }

    /**
     * 이벤트가 주를 넘어가는지 확인
     * TODO : 유틸에 작성할지 이벤트 관련 훅에 작성할지
     */

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

    /**
     * 날짜를 YYYY.MM.DD 형식으로 포맷팅
     * @example formatDateDisplay(new Date(2024, 0, 1)) // "2024.01.01"
     */
    static formatDateDisplay(date: Date): string {
        return format(date, 'yyyy.MM.dd');
    }

    /**
     * 시간 문자열을 HH:mm 형식으로 포맷팅
     * @param time "HH:mm:ss" 또는 "HH:mm" 형식의 시간 문자열
     * @returns "HH:mm" 형식의 시간 문자열, 없으면 빈 문자열
     * @example formatTimeDisplay("14:30:00") // "14:30"
     * @example formatTimeDisplay("09:05") // "09:05"
     */
    static formatTimeDisplay(time: string | null | undefined): string {
        if (!time) return '';
        // "HH:mm:ss" 형식이면 "HH:mm"만 추출
        return time.substring(0, 5);
    }

    /**
     * Date 객체를 HH:mm 형식으로 포맷팅 (HTML input type="time"용)
     * @example formatTimeForInput(new Date(2024, 0, 1, 14, 30)) // "14:30"
     */
    static formatTimeForInput(date: Date): string {
        return format(date, 'HH:mm');
    }

    /**
     * 이벤트 날짜 범위를 표시용 문자열로 포맷팅
     * 같은 날짜면 하나만, 다르면 범위로 표시
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @returns 포맷팅된 날짜 범위 문자열
     * @example formatEventDateRange(new Date(2024, 0, 1), new Date(2024, 0, 1)) // "2024.01.01"
     * @example formatEventDateRange(new Date(2024, 0, 1), new Date(2024, 0, 5)) // "2024.01.01 ~ 2024.01.05"
     */
    static formatEventDateRange(startDate: Date, endDate: Date): string {
        const startDateStr = this.formatDateDisplay(startDate);
        const endDateStr = this.formatDateDisplay(endDate);

        // 같은 날짜인 경우
        if (startDateStr === endDateStr) {
            return startDateStr;
        }

        return `${startDateStr} ~ ${endDateStr}`;
    }

    /**
     * 이벤트 시간 범위를 표시용 문자열로 포맷팅
     * @param isAllDay 종일 여부
     * @param startTime 시작 시간 (HH:mm 형식)
     * @param endTime 종료 시간 (HH:mm 형식)
     * @returns 포맷팅된 시간 범위 문자열
     * @example formatEventTimeRange(false, "09:00", "18:00") // "09:00 ~ 18:00"
     * @example formatEventTimeRange(true) // "종일"
     * @example formatEventTimeRange(false, "09:00", null) // "09:00부터"
     */
    static formatEventTimeRange(
        isAllDay: boolean,
        startTime?: string | null,
        endTime?: string | null,
    ): string {
        if (isAllDay) {
            return '종일';
        }

        const formattedStartTime = this.formatTimeDisplay(startTime);
        const formattedEndTime = this.formatTimeDisplay(endTime);

        if (!formattedStartTime && !formattedEndTime) {
            return '시간 미정';
        }

        if (formattedStartTime && formattedEndTime) {
            return `${formattedStartTime} ~ ${formattedEndTime}`;
        }

        if (formattedStartTime) {
            return `${formattedStartTime}부터`;
        }

        if (formattedEndTime) {
            return `${formattedEndTime}까지`;
        }

        return '';
    }
}
