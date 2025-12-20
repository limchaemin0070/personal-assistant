/**
 * 재사용 가능한 정렬 비교 함수들
 * 각 함수는 Array.sort()에 전달할 수 있는 comparator 형태
 */

// 날짜가 있는 객체를 위한 타입
type HasDate = { date?: string | null };
type HasTime = { time?: string | null };
type HasDateTime = HasDate & HasTime;

/**
 * 날짜를 오름차순으로 비교 (과거 → 미래)
 * 날짜가 없는 항목은 맨 뒤로
 */
export const compareDateAsc = (a: HasDate, b: HasDate): number => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1; // a를 뒤로
    if (!b.date) return -1; // b를 뒤로

    return new Date(a.date).getTime() - new Date(b.date).getTime();
};

/**
 * 날짜를 내림차순으로 비교 (미래 → 과거)
 * 날짜가 없는 항목은 맨 뒤
 */
export const compareDateDesc = (a: HasDate, b: HasDate): number => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1; // a를 뒤로
    if (!b.date) return -1; // b를 뒤로

    return new Date(b.date).getTime() - new Date(a.date).getTime();
};

/**
 * 시간을 오름차순으로 비교 (HH:mm 형식)
 * 예: "09:00" < "14:30"
 */
export const compareTimeAsc = (a: HasTime, b: HasTime): number => {
    const timeA = a.time || '';
    const timeB = b.time || '';
    return timeA.localeCompare(timeB);
};

/**
 * 시간을 내림차순으로 비교 (HH:mm 형식)
 * 예: "14:30" > "09:00"
 */
export const compareTimeDesc = (a: HasTime, b: HasTime): number => {
    const timeA = a.time || '';
    const timeB = b.time || '';
    return timeB.localeCompare(timeA);
};

/**
 * 날짜와 시간을 함께 오름차순으로 비교
 * 날짜가 같으면 시간으로 2차 정렬
 */
export const compareDateTimeAsc = (a: HasDateTime, b: HasDateTime): number => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;

    const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();

    if (dateCompare !== 0) return dateCompare;

    // 날짜가 같으면 시간으로 비교
    return compareTimeAsc(a, b);
};

/**
 * 날짜와 시간을 함께 내림차순으로 비교
 * 날짜가 같으면 시간으로 2차 정렬
 */
export const compareDateTimeDesc = (a: HasDateTime, b: HasDateTime): number => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;

    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();

    if (dateCompare !== 0) return dateCompare;

    // 날짜가 같으면 시간으로 비교
    return compareTimeDesc(a, b);
};
