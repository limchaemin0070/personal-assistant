import { defaultApi } from '@/utils/api';
import type { AlarmResponse, Alarm } from '@/types/alarm';
import type { AlarmFormData } from '@/schemas/alarmSchema';

export const alarmService = {
    // 특정 유저의 알람 조회
    async getAlarmsByUserId(): Promise<Alarm[]> {
        const response = await defaultApi<AlarmResponse[]>('/alarms', {
            method: 'GET',
        });

        if (!response.data.result) {
            return [];
        }

        // AlarmResponse를 Alarm로 변환
        return response.data.result.map((alarm) => ({
            id: alarm.alarm_id,
            title: alarm.title || '',
            time: alarm.time,
            date: alarm.date ? new Date(alarm.date) : null,
            repeat_days: alarm.repeat_days
                ? JSON.parse(alarm.repeat_days)
                : null,
            is_repeat: alarm.is_repeat,
            is_active: alarm.is_active,
            userId: alarm.user_id,
            createdAt: alarm.created_at
                ? new Date(alarm.created_at)
                : undefined,
            updatedAt: alarm.updated_at
                ? new Date(alarm.updated_at)
                : undefined,
        }));
    },

    // 알람 생성
    async createAlarm(data: AlarmFormData): Promise<Alarm> {
        // repeat_days가 있으면 is_repeat = true, 없으면 false
        const isRepeat = data.repeat_days && data.repeat_days.length > 0;

        const payload: {
            title: string;
            date: string | null;
            time: string;
            is_repeat: boolean;
            repeat_days: number[] | null;
            is_active: boolean;
            alarm_type: 'basic' | 'event';
        } = {
            title: data.title || '',
            date: data.date || null,
            time: data.time,
            is_repeat: isRepeat,
            repeat_days: isRepeat && data.repeat_days ? data.repeat_days : null,
            is_active: true,
            alarm_type: 'basic', // 기본 알람 타입
        };

        const response = await defaultApi<AlarmResponse>('/alarms', {
            method: 'POST',
            data: payload,
        });

        if (!response.data.result) {
            throw new Error('알람 생성에 실패했습니다.');
        }

        const alarm = response.data.result;

        // AlarmResponse를 Alarm로 변환
        return {
            id: alarm.alarm_id,
            title: alarm.title || '',
            time: alarm.time,
            date: alarm.date ? new Date(alarm.date) : null,
            repeat_days: alarm.repeat_days
                ? JSON.parse(alarm.repeat_days)
                : null,
            is_repeat: alarm.is_repeat,
            is_active: alarm.is_active,
            userId: alarm.user_id,
            createdAt: alarm.created_at
                ? new Date(alarm.created_at)
                : undefined,
            updatedAt: alarm.updated_at
                ? new Date(alarm.updated_at)
                : undefined,
        };
    },

    // 알람 수정
    async updateAlarm(
        alarmId: string | number,
        data: AlarmFormData,
    ): Promise<Alarm> {
        // repeat_days가 있으면 is_repeat = true, 없으면 false
        const isRepeat = data.repeat_days && data.repeat_days.length > 0;

        // 백엔드는 repeat_days를 배열로 받아서 자동으로 JSON.stringify 처리
        const payload: {
            title?: string;
            date?: string | null;
            time: string;
            is_repeat: boolean;
            repeat_days: number[] | null;
            alarm_type: 'basic' | 'event';
        } = {
            title: data.title,
            date: data.date || null,
            time: data.time,
            is_repeat: isRepeat,
            repeat_days: isRepeat && data.repeat_days ? data.repeat_days : null,
            alarm_type: 'basic', // 기본 알람 타입
        };

        const response = await defaultApi<AlarmResponse>(`/alarms/${alarmId}`, {
            method: 'PUT',
            data: payload,
        });

        if (!response.data.result) {
            throw new Error('알람 수정에 실패했습니다.');
        }

        const alarm = response.data.result;

        // AlarmResponse를 Alarm로 변환
        return {
            id: alarm.alarm_id,
            title: alarm.title || '',
            time: alarm.time,
            date: alarm.date ? new Date(alarm.date) : null,
            repeat_days: alarm.repeat_days
                ? JSON.parse(alarm.repeat_days)
                : null,
            is_repeat: alarm.is_repeat,
            is_active: alarm.is_active,
            userId: alarm.user_id,
            createdAt: alarm.created_at
                ? new Date(alarm.created_at)
                : undefined,
            updatedAt: alarm.updated_at
                ? new Date(alarm.updated_at)
                : undefined,
        };
    },

    // 알람 활성 상태 토글
    async toggleActive(alarmId: number, isActive: boolean) {
        return defaultApi(`/alarms/${alarmId}/active`, {
            method: 'PATCH',
            data: { isActive },
        });
    },

    // 알람 삭제
    async deleteAlarm(alarmId: string | number): Promise<void> {
        await defaultApi(`/alarms/${alarmId}`, {
            method: 'DELETE',
        });
    },
};
