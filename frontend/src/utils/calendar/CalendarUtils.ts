import {
    startOfMonth,
    startOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    format,
    startOfDay,
    addDays,
    addWeeks,
    subWeeks,
    subDays,
    endOfWeek,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import type { CalendarEvent } from '@/types/calendar';

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
     * 요일을 한국어로 포맷팅
     * @param date 날짜 객체
     * @param short 짧은 형식 여부 (기본값: false)
     * @returns 한국어 요일 문자열
     * @example formatDayOfWeek(new Date(2024, 0, 1)) // "월요일"
     * @example formatDayOfWeek(new Date(2024, 0, 1), true) // "월"
     */
    static formatDayOfWeek(date: Date, short: boolean = false): string {
        return this.formatKorean(date, short ? 'EEE' : 'EEEE');
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
     * Date 객체 또는 시간 문자열을 "오전 9:00", "오후 5:00" 형식으로 포맷팅
     * @param dateOrTime Date 객체 또는 "HH:mm" 또는 "HH:mm:ss" 형식의 시간 문자열
     * @returns "오전/오후 H:mm" 형식의 시간 문자열, 또는 그대로 반환 (종일 등)
     * @example formatTimeKorean(new Date(2024, 0, 1, 9, 0)) // "오전 9:00"
     * @example formatTimeKorean(new Date(2024, 0, 1, 17, 0)) // "오후 5:00"
     * @example formatTimeKorean(new Date(2024, 0, 1, 0, 0)) // "오전 12:00"
     * @example formatTimeKorean(new Date(2024, 0, 1, 12, 0)) // "오후 12:00"
     * @example formatTimeKorean("09:00") // "오전 9:00"
     * @example formatTimeKorean("09:00:00") // "오전 9:00"
     * @example formatTimeKorean("17:00") // "오후 5:00"
     * @example formatTimeKorean("17:00:00") // "오후 5:00"
     * @example formatTimeKorean("종일") // "종일"
     */
    static formatTimeKorean(dateOrTime: Date | string): string {
        // 문자열인 경우
        if (typeof dateOrTime === 'string') {
            // "종일" 같은 특수 문자열은 그대로 반환
            if (dateOrTime === '종일' || dateOrTime === '-') {
                return dateOrTime;
            }

            // "HH:mm" 또는 "HH:mm:ss" 형식인지 확인
            const timePattern = /^(\d{1,2}):(\d{2})(?::\d{2})?$/;
            const match = dateOrTime.match(timePattern);
            if (!match) {
                return dateOrTime; // 형식이 맞지 않으면 그대로 반환
            }

            const hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);

            const ampm = hours < 12 ? '오전' : '오후';

            let displayHours: number;
            if (hours === 0) {
                displayHours = 12;
            } else if (hours > 12) {
                displayHours = hours - 12;
            } else {
                displayHours = hours;
            }

            const displayMinutes = minutes.toString().padStart(2, '0');
            return `${ampm} ${displayHours}:${displayMinutes}`;
        }

        // Date 객체인 경우
        const hours = dateOrTime.getHours();
        const minutes = dateOrTime.getMinutes();
        const ampm = hours < 12 ? '오전' : '오후';

        let displayHours: number;
        if (hours === 0) {
            displayHours = 12;
        } else if (hours > 12) {
            displayHours = hours - 12;
        } else {
            displayHours = hours;
        }

        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${ampm} ${displayHours}:${displayMinutes}`;
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

    /**
     * 주간 뷰 네비게이션 - 다음 주로 이동
     * @param date 현재 날짜
     * @returns 다음 주의 시작일 (일요일)
     * @example getNextWeek(new Date(2024, 0, 7)) // 2024-01-14 (일요일)
     */
    static getNextWeek(date: Date): Date {
        const weekStart = startOfWeek(date, { weekStartsOn: 0 });
        return addWeeks(weekStart, 1);
    }

    /**
     * 주간 뷰 네비게이션 - 이전 주로 이동
     * @param date 현재 날짜
     * @returns 이전 주의 시작일 (일요일)
     * @example getPrevWeek(new Date(2024, 0, 7)) // 2023-12-31 (일요일)
     */
    static getPrevWeek(date: Date): Date {
        const weekStart = startOfWeek(date, { weekStartsOn: 0 });
        return subWeeks(weekStart, 1);
    }

    /**
     * 주간 뷰 네비게이션 - 주의 시작일 (일요일) 반환
     * @param date 현재 날짜
     * @returns 해당 주의 시작일 (일요일)
     * @example getWeekStart(new Date(2024, 0, 10)) // 2024-01-07 (일요일)
     */
    static getWeekStart(date: Date): Date {
        return startOfWeek(date, { weekStartsOn: 0 });
    }

    /**
     * 주간 뷰 네비게이션 - 주의 종료일 (토요일) 반환
     * @param date 현재 날짜
     * @returns 해당 주의 종료일 (토요일)
     * @example getWeekEnd(new Date(2024, 0, 10)) // 2024-01-13 (토요일)
     */
    static getWeekEnd(date: Date): Date {
        return endOfWeek(date, { weekStartsOn: 0 });
    }

    /**
     * 일간 뷰 네비게이션 - 다음 날로 이동
     * @param date 현재 날짜
     * @returns 다음 날
     * @example getNextDay(new Date(2024, 0, 1)) // 2024-01-02
     */
    static getNextDay(date: Date): Date {
        return addDays(date, 1);
    }

    /**
     * 일간 뷰 네비게이션 - 이전 날로 이동
     * @param date 현재 날짜
     * @returns 이전 날
     * @example getPrevDay(new Date(2024, 0, 1)) // 2023-12-31
     */
    static getPrevDay(date: Date): Date {
        return subDays(date, 1);
    }

    /**
     * 주간 뷰 헤더 텍스트 만들기
     * @param date 주간 뷰의 기준 날짜 (해당 주의 아무 날짜)
     * @returns "YYYY.MM.DD ~ YYYY.MM.DD" 형식의 문자열
     * @example getWeekRangeText(new Date(2024, 0, 10)) // "2024.01.07 ~ 2024.01.13"
     */
    static getWeekRangeText(date: Date): string {
        const weekStart = this.getWeekStart(date);
        const weekEnd = this.getWeekEnd(date);
        const startStr = this.formatDateDisplay(weekStart);
        const endStr = this.formatDateDisplay(weekEnd);

        // 같은 주이지만 다른 달인 경우
        if (weekStart.getMonth() === weekEnd.getMonth()) {
            return `${startStr} ~ ${endStr}`;
        }

        return `${startStr} ~ ${endStr}`;
    }

    /**
     * 일간 뷰 헤더 텍스트 만들기
     * @param date 날짜
     * @returns "YYYY년 M월 D일 (요일)" 형식의 문자열
     * @example getDayText(new Date(2024, 0, 1)) // "2024년 1월 1일 (월요일)"
     */
    static getDayText(date: Date): string {
        const dateStr = this.formatKorean(date, 'yyyy년 M월 d일');
        const dayOfWeek = this.formatDayOfWeek(date);
        return `${dateStr} (${dayOfWeek})`;
    }

    /**
     * 일간 뷰용 이벤트 시간순 정렬
     * 리마인더처럼 종일 이벤트를 먼저 표시하고, 이후 시작 시간 순으로 정렬합니다.
     * @param events 정렬할 이벤트 배열
     * @returns 정렬된 이벤트 배열
     * @example
     * // 정렬 순서:
     * // 1. 종일 이벤트 (시작 날짜 순)
     * // 2. 시간이 있는 이벤트 (시작 시간 순)
     * // 3. 시간이 없는 이벤트 (시작 날짜 순)
     */
    static sortEventsByTime(events: CalendarEvent[]): CalendarEvent[] {
        return [...events].sort((a, b) => {
            // 1. 종일 이벤트가 먼저
            if (a.isAllDay && !b.isAllDay) return -1;
            if (!a.isAllDay && b.isAllDay) return 1;

            // 둘 다 종일이거나 둘 다 종일이 아닌 경우
            if (a.isAllDay && b.isAllDay) {
                // 종일 이벤트는 시작 날짜 순으로 정렬
                return a.startDate.getTime() - b.startDate.getTime();
            }

            // 둘 다 종일이 아닌 경우
            // 2. 시작 시간이 있는 이벤트가 먼저
            const aHasTime = !!(a.startTime && !a.isAllDay);
            const bHasTime = !!(b.startTime && !b.isAllDay);

            if (aHasTime && !bHasTime) return -1;
            if (!aHasTime && bHasTime) return 1;

            // 둘 다 시간이 있으면 시간 순으로 정렬
            if (aHasTime && bHasTime) {
                const timeCompare = (a.startTime || '').localeCompare(
                    b.startTime || '',
                );
                if (timeCompare !== 0) return timeCompare;
                // 시간이 같으면 시작 날짜 순
                return a.startDate.getTime() - b.startDate.getTime();
            }

            // 둘 다 시간이 없으면 시작 날짜 순으로 정렬
            return a.startDate.getTime() - b.startDate.getTime();
        });
    }
}
