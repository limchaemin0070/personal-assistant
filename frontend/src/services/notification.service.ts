import { defaultApi } from '@/utils/api';

export interface SSETokenResponse {
    sseToken: string;
    expiresIn: number;
    expiresAt: number;
}

export const notificationService = {
    /**
     * SSE 전용 토큰 발급
     */
    async issueSSEToken(): Promise<string> {
        const response = await defaultApi<SSETokenResponse>(
            '/notification/sse-token',
            {
                method: 'POST',
            },
        );

        if (!response.data.result) {
            throw new Error('SSE 토큰 발급에 실패했습니다.');
        }

        return response.data.result.sseToken;
    },
};
