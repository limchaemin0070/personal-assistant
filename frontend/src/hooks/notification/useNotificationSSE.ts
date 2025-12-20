import { useState, useRef, useCallback, useEffect } from 'react';
import { SSEConnectionService } from '@/services/sseConnection.service';
import { SSETokenService } from '@/services/sseToken.service';
import {
    useNotificationStore,
    type AlarmEvent,
} from '@/store/useNotificationStore';
import type { SSEConfig } from '@/types';
import { showBrowserNotification } from '@/utils/notification/notificationUtils';
import { playNotificationSound } from '@/utils/notification/playNotificationSound';
import { useAuth } from '../Auth/useAuth';

const SSE_CONFIG: SSEConfig = {
    RECONNECT_DELAY: 5000, // 5초
} as const;

export function useAlarmSSE() {
    const [sseToken, setSseToken] = useState<string | null>(() =>
        SSETokenService.getStoredToken(),
    );

    const connectionRef = useRef<SSEConnectionService | null>(null);
    const { isAuthenticated } = useAuth();

    // Zustand Store
    const setActiveAlarm = useNotificationStore(
        (state) => state.setActiveAlarm,
    );
    const addToQueue = useNotificationStore((state) => state.addToQueue);
    const activeAlarm = useNotificationStore((state) => state.activeAlarm);
    const settings = useNotificationStore((state) => state.settings);
    const setConnected = useNotificationStore((state) => state.setConnected);
    const setReconnectAttempts = useNotificationStore(
        (state) => state.setReconnectAttempts,
    );

    const baseURL = import.meta.env.VITE_SERVER_URL;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 알람 이벤트 처리
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const handleAlarmEvent = useCallback(
        (event: AlarmEvent) => {
            console.log('⏰ [알람 트리거] 알람 이벤트 처리 시작:', event);

            // 활성 알람이 있으면 큐에 추가, 없으면 활성화
            if (activeAlarm) {
                console.log('📥 [알람 트리거] 활성 알람이 있어 큐에 추가');
                addToQueue(event);
            } else {
                console.log('✅ [알람 트리거] 활성 알람으로 설정');
                setActiveAlarm(event);
            }

            // 사운드 재생
            if (settings.soundEnabled) {
                console.log('🔊 [알람 트리거] 알림 소리 재생');
                playNotificationSound();
            }

            // 브라우저 알림 표시
            if (settings.notificationEnabled) {
                console.log('📱 [알람 트리거] 브라우저 알림 표시');
                showBrowserNotification(event.alarm);
            }
        },
        [activeAlarm, addToQueue, setActiveAlarm, settings],
    );

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SSE 연결
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const connectSSE = useCallback(async () => {
        if (!isAuthenticated) {
            console.log('⚠️ 인증 안 됨 - SSE 연결 중단');
            connectionRef.current?.disconnect();
            setConnected(false);
            return;
        }

        try {
            // 유효한 토큰 가져오기 (필요시 새로 발급)
            const token = await SSETokenService.getValidToken();

            if (!token) {
                console.error('❌ SSE 토큰 발급 실패 - 연결 중단');
                return;
            }

            // 토큰 상태 업데이트
            setSseToken(token);

            // SSE 연결
            connectionRef.current?.connect(token);
        } catch (error) {
            console.error('❌ SSE 연결 시도 중 예외 발생:', error);
            connectionRef.current?.disconnect();
            setConnected(false);
        }
    }, [isAuthenticated, setConnected]);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SSE 연결 초기화 및 이벤트 핸들러 설정
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    useEffect(() => {
        if (!connectionRef.current) {
            connectionRef.current = new SSEConnectionService(
                baseURL,
                SSE_CONFIG,
                {
                    onAlarm: handleAlarmEvent,
                    onConnected: () => {
                        setConnected(true);
                        setReconnectAttempts(0);
                    },
                    onError: () => {
                        setConnected(false);
                        if (isAuthenticated) {
                            connectSSE();
                        }
                    },
                },
            );
        }

        // 핸들러 업데이트 (의존성 변경 시)
        connectionRef.current.updateHandlers({
            onAlarm: handleAlarmEvent,
        });
    }, [
        baseURL,
        handleAlarmEvent,
        isAuthenticated,
        setConnected,
        setReconnectAttempts,
    ]);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 다른 탭과 토큰 동기화
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'sse_token') {
                console.log('🔄 다른 탭에서 SSE 토큰 변경 감지');
                setSseToken(e.newValue);

                // 토큰이 변경되었으면 재연결
                if (e.newValue && isAuthenticated) {
                    connectSSE();
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [isAuthenticated, connectSSE]);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 인증 상태에 따른 연결/해제
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    useEffect(() => {
        if (isAuthenticated) {
            console.log('👤 인증됨 - SSE 연결 시작');
            connectSSE();
        } else {
            console.log('👤 인증 안 됨 - SSE 연결 종료 및 정리');
            connectionRef.current?.disconnect();
            setConnected(false);

            // 토큰 정리
            setSseToken(null);
            SSETokenService.clearToken();
        }

        // 컴포넌트 언마운트 시 정리
        return () => {
            connectionRef.current?.disconnect();
        };
    }, [isAuthenticated, connectSSE, setConnected]);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 수동 재연결
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const reconnect = useCallback(() => {
        console.log('🔄 수동 재연결 요청');
        connectSSE();
    }, [connectSSE]);

    return {
        reconnect,
        isConnected: !!(
            isAuthenticated &&
            sseToken &&
            connectionRef.current?.isConnected()
        ),
    };
}
