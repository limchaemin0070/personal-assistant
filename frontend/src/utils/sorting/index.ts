/**
 * 도메인별 정렬 정책
 * 각 도메인(Alarm, Reminder, Calendar)의 정렬 의도가 다르므로 분리하여 관리합니다.
 */

import type { Alarm } from '@/types/alarm';
import type { Reminder } from '@/types';
import type { CalendarEvent } from '@/types/calendar';
import {
    compareTimeAsc,
    compareDateTimeAsc,
    compareDateDesc,
    compareTimeDesc,
} from './comparators';

/**
 * Alarm 정렬: 실행 우선순위 기준
 *
 * 정렬 규칙:
 * 1. 반복 알람을 먼저 표시 (is_repeat === true)
 * 2. 반복 알람끼리는 시간순 정렬 (빠른 시간이 위로)
 * 3. 날짜 지정 알람끼리는 날짜+시간순 정렬 (빠른 것이 위로)
 *
 * @param alarms 정렬할 알람 배열
 * @returns 정렬된 새 배열 (원본 배열은 변경되지 않음)
 */
export const sortAlarmsByPriority = (alarms: Alarm[]): Alarm[] => {
    return [...alarms].sort((a, b) => {
        // 1. 반복 알람을 먼저 표시
        if (a.is_repeat && !b.is_repeat) return -1;
        if (!a.is_repeat && b.is_repeat) return 1;

        // 2. 반복 알람끼리는 시간순으로 정렬
        if (a.is_repeat && b.is_repeat) {
            return compareTimeAsc(a, b);
        }

        // 3. 날짜 지정 알람끼리는 날짜+시간순으로 정렬
        if (!a.is_repeat && !b.is_repeat) {
            return compareDateTimeAsc(a, b);
        }

        return 0;
    });
};

/**
 * Reminder 정렬: 마감일 우선순위 기준
 *
 * 정렬 규칙:
 * 1. 날짜가 없는 항목은 맨 아래로
 * 2. 날짜를 내림차순 정렬 (가장 미래 날짜가 위로)
 * 3. 같은 날짜: 종일 이벤트(시간 미지정)를 먼저 표시
 * 4. 같은 날짜 + 둘 다 시간 지정: 시간 내림차순 정렬
 *
 * @param reminders 정렬할 리마인더 배열
 * @returns 정렬된 새 배열 (원본 배열은 변경되지 않음)
 */
export const sortRemindersByDeadline = (reminders: Reminder[]): Reminder[] => {
    return [...reminders].sort((a, b) => {
        // 1. 날짜 비교 (내림차순: 미래 → 과거)
        const dateCompare = compareDateDesc(a, b);
        if (dateCompare !== 0) return dateCompare;

        // 2. 같은 날짜: 종일 이벤트(시간 미지정) 우선
        const aHasTime = !!(a.time && !a.isAllDay);
        const bHasTime = !!(b.time && !b.isAllDay);

        if (aHasTime && !bHasTime) return 1; // a를 뒤로
        if (!aHasTime && bHasTime) return -1; // b를 뒤로

        // 3. 둘 다 시간이 있을 경우 시간 내림차순
        if (aHasTime && bHasTime) {
            return compareTimeDesc(a, b);
        }

        return 0;
    });
};

/**
 * Calendar Event 정렬: 시각적 배치 기준
 *
 * 정렬 규칙:
 * - 시작 날짜/시간 오름차순 (빠른 것이 위로)
 *
 * 주의: 이 정렬은 단순 시간순 정렬이며,
 * 실제 월간 뷰의 레이아웃 계산은 useCalendarLayout의 calculateMonthLayout에서 처리됩니다.
 *
 * @param events 정렬할 이벤트 배열
 * @returns 정렬된 새 배열 (원본 배열은 변경되지 않음)
 */
export const sortEventsByStartDate = (
    events: CalendarEvent[],
): CalendarEvent[] => {
    return [...events].sort((a, b) => {
        return a.startDate.getTime() - b.startDate.getTime();
    });
};
