import { useMemo, useCallback } from 'react';
import { CalendarUtils } from '@/utils/calendar';
import { isSameDay, isWithinInterval, startOfDay } from 'date-fns';

/**
 * 이벤트 데이터 관리
 * @param events 해당하는 달의 이벤트 목록
 * @param currentDate 오늘 날짜
 */
export const useCalendarEvents = (
    events: CalendarEvent[],
    currentDate: Date,
) => {
    // 해당하는 달의 일정 전부 가져와서 보여줌
    const eventsByDate = () => {
        const even;
    };

    // 해당하는 날짜의 이벤트(일정)을 모두 불러오기
};
