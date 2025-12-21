/**
 * 알람 페이로드 변환 유틸리티
 * 폼 데이터를 API 페이로드로 변환하는 로직을 분리
 */
import type { AlarmFormData } from '@/schemas/alarmSchema';

export interface AlarmPayload {
    title: string;
    date: string | null;
    time: string;
    is_repeat: boolean;
    repeat_days: number[] | null;
    is_active: boolean;
    alarm_type: 'repeat' | 'once';
}

/**
 * 알람 폼 데이터를 API 페이로드로 변환
 * @param data 폼 데이터
 * @returns API 페이로드
 */
export const transformAlarmFormDataToPayload = (
    data: AlarmFormData,
): AlarmPayload => {
    const isRepeat = data.repeat_days && data.repeat_days.length > 0;

    return {
        title: data.title || '',
        date: data.date || null,
        time: data.time,
        is_repeat: isRepeat,
        repeat_days: isRepeat && data.repeat_days ? data.repeat_days : null,
        is_active: true,
        alarm_type: isRepeat ? 'repeat' : 'once',
    };
};

/**
 * 알람 수정용 페이로드 변환 (일부 필드만 선택적)
 */
export const transformAlarmUpdatePayload = (
    data: AlarmFormData,
): Partial<AlarmPayload> => {
    const isRepeat = data.repeat_days && data.repeat_days.length > 0;

    return {
        title: data.title,
        date: data.date || null,
        time: data.time,
        is_repeat: isRepeat,
        repeat_days: isRepeat && data.repeat_days ? data.repeat_days : null,
        alarm_type: isRepeat ? 'repeat' : 'once',
    };
};
