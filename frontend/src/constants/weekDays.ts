import type { SelectOption } from '@/components/common/SelectDropdown';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0: 일요일, 6: 토요일

/**
 * 요일 옵션 배열
 * SelectDropdown에서 사용할 수 있는 형태로 정의
 */
export const WEEK_DAYS: SelectOption<DayOfWeek>[] = [
    { value: 0, label: '일' },
    { value: 1, label: '월' },
    { value: 2, label: '화' },
    { value: 3, label: '수' },
    { value: 4, label: '목' },
    { value: 5, label: '금' },
    { value: 6, label: '토' },
] as const;

/**
 * 요일 값으로 라벨을 찾는 Map
 * 빠른 조회를 위해 Map 자료구조 사용
 */
export const WEEK_DAY_LABELS = new Map<DayOfWeek, string>(
    WEEK_DAYS.map((day) => [day.value, day.label])
);

/**
 * 요일 값으로 라벨을 가져오는 헬퍼 함수
 * @param dayOfWeek 요일 값 (0-6)
 * @returns 요일 라벨 (예: '일', '월', ...)
 */
export const getWeekDayLabel = (dayOfWeek: DayOfWeek): string => {
    return WEEK_DAY_LABELS.get(dayOfWeek) ?? '';
};

/**
 * 여러 요일 값으로 라벨 배열을 가져오는 헬퍼 함수
 * @param daysOfWeek 요일 값 배열
 * @returns 요일 라벨 배열 (예: ['월', '수', '금'])
 */
export const getWeekDayLabels = (daysOfWeek: DayOfWeek[]): string[] => {
    return daysOfWeek.map(getWeekDayLabel).filter(Boolean);
};

