// services/sseToken.service.ts
import type { SSETokenData } from '@/types';
import { defaultApi } from '@/utils/api';

const SSE_TOKEN_KEY = 'sse_token';
const SSE_TOKEN_EXPIRES_KEY = 'sse_token_expires_at';

export class SSETokenService {
    /**
     * localStorage에서 저장된 토큰 가져오기
     */
    static getStoredToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(SSE_TOKEN_KEY);
    }

    /**
     * localStorage에서 토큰 만료 시간 가져오기
     */
    static getStoredExpiration(): number | null {
        if (typeof window === 'undefined') return null;
        const expiresAt = localStorage.getItem(SSE_TOKEN_EXPIRES_KEY);
        return expiresAt ? parseInt(expiresAt, 10) : null;
    }

    /**
     * 토큰이 만료되었는지 확인
     */
    static isTokenExpired(): boolean {
        const expiresAt = this.getStoredExpiration();
        if (!expiresAt) return true;
        return expiresAt < Date.now();
    }

    /**
     * 토큰 저장
     */
    static saveToken(tokenData: SSETokenData): void {
        if (typeof window === 'undefined') return;

        localStorage.setItem(SSE_TOKEN_KEY, tokenData.sseToken);
        localStorage.setItem(
            SSE_TOKEN_EXPIRES_KEY,
            tokenData.expiresAt.toString(),
        );

        console.log('✅ SSE 토큰 저장 완료', {
            expiresIn: `${tokenData.expiresIn}초 (${tokenData.expiresIn / 60}분)`,
            expiresAt: new Date(tokenData.expiresAt).toLocaleString(),
        });
    }

    /**
     * 토큰 삭제
     */
    static clearToken(): void {
        if (typeof window === 'undefined') return;

        localStorage.removeItem(SSE_TOKEN_KEY);
        localStorage.removeItem(SSE_TOKEN_EXPIRES_KEY);
        console.log('🗑️ SSE 토큰 삭제 완료');
    }

    /**
     * 서버에서 새 토큰 발급
     */
    static async fetchNewToken(): Promise<SSETokenData | null> {
        try {
            console.log('🎫 SSE 토큰 발급 요청...');

            const response = await defaultApi<SSETokenData>(
                '/notification/sse-token',
                {
                    method: 'POST',
                },
            );

            const data = response.data.result;

            if (!data) {
                throw new Error('토큰 발급 실패: 결과 데이터 없음');
            }

            console.log('✅ SSE 토큰 발급 성공');
            this.saveToken(data);

            return data;
        } catch (error) {
            console.error('❌ SSE 토큰 발급 실패:', error);
            return null;
        }
    }

    /**
     * 유효한 토큰 가져오기 (필요시 새로 발급)
     */
    static async getValidToken(): Promise<string | null> {
        const storedToken = this.getStoredToken();

        // 토큰이 있고 만료되지 않았으면 기존 토큰 사용
        if (storedToken && !this.isTokenExpired()) {
            console.log('✅ 기존 SSE 토큰 사용');
            return storedToken;
        }

        // 토큰이 없거나 만료되었으면 새로 발급
        console.log('🎫 SSE 토큰 없음 또는 만료 - 새로 발급');
        const tokenData = await this.fetchNewToken();

        return tokenData?.sseToken ?? null;
    }
}
