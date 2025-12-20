import type { ApiSuccessResponse } from '@/types';
import { defaultApi } from '@/utils/api';

export interface UserInfo {
    user_id: number;
    email: string;
    nickname: string;
    notification_enabled: boolean;
    created_at: string;
    updated_at: string;
}

export const userService = {
    // 현재 로그인한 사용자 정보 조회
    async getCurrentUser(): Promise<ApiSuccessResponse<UserInfo>> {
        const response = await defaultApi<UserInfo>('/users/me', {
            method: 'GET',
        });
        return response.data;
    },

    // 사용자 알람 설정 업데이트
    async updateNotificationEnabled(
        notification_enabled: boolean,
    ): Promise<ApiSuccessResponse<UserInfo>> {
        const response = await defaultApi<UserInfo>('/users/me/notification', {
            method: 'PATCH',
            data: { notification_enabled },
        });
        return response.data;
    },
};
