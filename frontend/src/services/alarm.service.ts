import { defaultApi } from '@/utils/api';
import type { AlarmResponse, Alarm } from '@/types/alarm';
import type { AlarmFormData } from '@/schemas/alarmSchema';
import {
    transformAlarmResponse,
    transformAlarmResponseArray,
} from '@/utils/transformers/alarmTransformer';
import {
    transformAlarmFormDataToPayload,
    transformAlarmUpdatePayload,
} from '@/utils/payloadTransformers/alarmPayloadTransformer';

export const alarmService = {
    // 특정 유저의 알람 조회
    async getAlarmsByUserId(): Promise<Alarm[]> {
        const response = await defaultApi<AlarmResponse[]>('/alarms', {
            method: 'GET',
        });

        if (!response.data.result) {
            return [];
        }

        return transformAlarmResponseArray(response.data.result);
    },

    // 알람 생성
    async createAlarm(data: AlarmFormData): Promise<Alarm> {
        const payload = transformAlarmFormDataToPayload(data);

        const response = await defaultApi<AlarmResponse>('/alarms', {
            method: 'POST',
            data: payload,
        });

        if (!response.data.result) {
            throw new Error('알람 생성에 실패했습니다.');
        }

        return transformAlarmResponse(response.data.result);
    },

    // 알람 수정
    async updateAlarm(
        alarmId: string | number,
        data: AlarmFormData,
    ): Promise<Alarm> {
        const payload = transformAlarmUpdatePayload(data);

        const response = await defaultApi<AlarmResponse>(`/alarms/${alarmId}`, {
            method: 'PUT',
            data: payload,
        });

        if (!response.data.result) {
            throw new Error('알람 수정에 실패했습니다.');
        }

        return transformAlarmResponse(response.data.result);
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
