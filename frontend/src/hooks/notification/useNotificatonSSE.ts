// hooks/useAlarmSSE.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    useNotificationStore,
    type AlarmEvent,
    type Alarm,
} from '@/store/useNotificationStore';
import { playNotificationSound } from '@/utils/notification/playNotificationSound';
import { useAuth } from '@/hooks/Auth/useAuth';
import { defaultApi } from '@/utils/api';

type BackendAlarmData = {
    alarmId: number;
    userId: number;
    title: string;
    message: string;
    scheduleId?: number | null;
    reminderId?: number | null;
    timestamp: string;
    alarmKind: 'repeat' | 'once';
};

type BackendAlarmPayload = {
    type: 'ALARM_TRIGGER';
    data: BackendAlarmData;
};

type SSETokenData = {
    sseToken: string;
    expiresIn: number;
    expiresAt: number;
};

function mapBackendToAlarmEvent(payload: BackendAlarmPayload): AlarmEvent {
    const { data } = payload;

    const alarm: Alarm = {
        alarm_id: data.alarmId,
        user_id: data.userId,
        title: data.title,
        time: data.timestamp,
        date: null,
        is_repeat: data.alarmKind === 'repeat',
        repeat_days: null,
        is_active: true,
        alarm_type: data.alarmKind,
        next_trigger_at: data.timestamp,
    };

    return {
        type: 'alarm_triggered',
        alarm,
        timestamp: data.timestamp,
    };
}
function showBrowserNotification(alarm: Alarm) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
        // eslint-disable-next-line no-new
        new Notification(alarm.title || '알람', {
            body: alarm.time,
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                // eslint-disable-next-line no-new
                new Notification(alarm.title || '알람', {
                    body: alarm.time,
                });
            }
        });
    }
}

export function useAlarmSSE() {
    const [sseToken, setSseToken] = useState<string | null>(() => {
        // 초기값: localStorage에서 읽기 (페이지 새로고침 대비)
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sse_token');
        }
        return null;
    });

    const eventSourceRef = useRef<EventSource | null>(null);
    const connectedTokenRef = useRef<string | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );

    const { isAuthenticated } = useAuth();

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

    const SSE_CONFIG = {
        RECONNECT_DELAY: 5000, // 5초
    } as const;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 연결 종료
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const closeConnection = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        connectedTokenRef.current = null;
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        setConnected(false);
    }, [setConnected]);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SSE 토큰 발급
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const fetchSSEToken =
        useCallback(async (): Promise<SSETokenData | null> => {
            if (!isAuthenticated) {
                console.log('⚠️ 인증 안 됨 - SSE 토큰 발급 불가');
                return null;
            }

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

                console.log('✅ SSE 토큰 발급 성공', {
                    expiresIn: `${data.expiresIn}초 (${data.expiresIn / 60}분)`,
                    expiresAt: new Date(data.expiresAt).toLocaleString(),
                });

                // localStorage 저장
                setSseToken(data.sseToken);
                localStorage.setItem('sse_token', data.sseToken);
                localStorage.setItem(
                    'sse_token_expires_at',
                    data.expiresAt.toString(),
                );

                return data;
            } catch (error) {
                console.error('❌ SSE 토큰 발급 실패:', error);
                return null;
            }
        }, [isAuthenticated]);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 알람 이벤트 처리
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const handleAlarmEvent = useCallback(
        (event: AlarmEvent) => {
            console.log('⏰ [알람 트리거] 알람 이벤트 처리 시작:', event);

            if (activeAlarm) {
                console.log('📥 [알람 트리거] 활성 알람이 있어 큐에 추가');
                addToQueue(event);
            } else {
                console.log('✅ [알람 트리거] 활성 알람으로 설정');
                setActiveAlarm(event);
            }

            if (settings.soundEnabled) {
                console.log('🔊 [알람 트리거] 알림 소리 재생');
                playNotificationSound();
            }

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
            closeConnection();
            return;
        }

        console.log('🔌 SSE 연결 준비...');

        // ✅ 토큰 확인 및 발급
        let token = sseToken;
        const expiresAt = localStorage.getItem('sse_token_expires_at');

        // 토큰이 없거나 만료되었으면 새로 발급
        if (!token || (expiresAt && parseInt(expiresAt, 10) < Date.now())) {
            console.log('🎫 SSE 토큰 없음 또는 만료 - 새로 발급');

            const tokenData = await fetchSSEToken();

            if (!tokenData) {
                console.error('❌ SSE 토큰 발급 실패 - 연결 중단');
                return;
            }

            token = tokenData.sseToken;
        } else {
            console.log('✅ 기존 SSE 토큰 사용');
        }

        if (!token) {
            console.error('❌ SSE 연결 시도 실패 - 토큰 없음');
            return;
        }

        // ✅ 이미 연결되어 있고 토큰이 같다면 재연결 불필요
        if (
            eventSourceRef.current &&
            eventSourceRef.current.readyState !== EventSource.CLOSED &&
            connectedTokenRef.current === token
        ) {
            console.log('✅ 이미 동일한 토큰으로 연결되어 있음');
            return;
        }

        closeConnection();
        console.log('🔌 SSE 새로운 연결 시도...');

        const eventSource = new EventSource(
            `${baseURL}/notification/stream?token=${encodeURIComponent(token)}`,
            { withCredentials: true },
        );

        eventSourceRef.current = eventSource;
        connectedTokenRef.current = token;

        eventSource.onopen = () => {
            console.log('✅ SSE 연결 성공');
            setConnected(true);
            setReconnectAttempts(0);
        };

        eventSource.addEventListener('connected', (rawEvent) => {
            const data = JSON.parse((rawEvent as MessageEvent).data);
            console.log('✅ SSE 인증 완료:', data);
        });

        eventSource.addEventListener('alarm', (rawEvent) => {
            try {
                console.log('🔔 [알람 트리거] 원본 이벤트 수신:', rawEvent);

                const eventData = (rawEvent as MessageEvent).data;

                if (
                    !eventData ||
                    eventData === 'null' ||
                    eventData.trim() === ''
                ) {
                    console.warn('⚠️ [알람 트리거] 빈 데이터 수신');
                    return;
                }

                const message = JSON.parse(eventData) as BackendAlarmPayload;

                if (
                    !message ||
                    message.type !== 'ALARM_TRIGGER' ||
                    !message.data
                ) {
                    console.warn(
                        '⚠️ [알람 트리거] 잘못된 메시지 형식:',
                        message,
                    );
                    return;
                }

                const alarmEvent = mapBackendToAlarmEvent(message);
                console.log('⏰ [알람 트리거] 변환된 알람 이벤트:', alarmEvent);

                handleAlarmEvent(alarmEvent);
            } catch (error) {
                console.error('❌ [알람 트리거] 이벤트 파싱 실패:', error);
            }
        });

        eventSource.addEventListener('ping', () => {
            console.log('💓 SSE ping received');
        });

        eventSource.onerror = (error) => {
            console.error('❌ SSE error:', error);
            closeConnection();

            if (isAuthenticated) {
                console.log(
                    `🔄 SSE 재연결 시도 (${SSE_CONFIG.RECONNECT_DELAY / 1000}초 후)...`,
                );
                reconnectTimeoutRef.current = setTimeout(() => {
                    connectSSE();
                }, SSE_CONFIG.RECONNECT_DELAY);
            }
        };
    }, [
        closeConnection,
        isAuthenticated,
        sseToken,
        baseURL,
        fetchSSEToken,
        setConnected,
        setReconnectAttempts,
        handleAlarmEvent,
        SSE_CONFIG.RECONNECT_DELAY,
    ]);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 다른 탭과 동기화
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'sse_token') {
                console.log('🔄 다른 탭에서 SSE 토큰 변경 감지');
                setSseToken(e.newValue);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 인증 상태 또는 토큰 변경 시 SSE 연결
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    useEffect(() => {
        if (isAuthenticated) {
            console.log('👤 인증됨 - SSE 연결 시작');
            connectSSE();
        } else {
            console.log('👤 인증 안 됨 - SSE 연결 종료 및 정리');
            closeConnection();

            // 토큰 정리
            setSseToken(null);
            localStorage.removeItem('sse_token');
            localStorage.removeItem('sse_token_expires_at');
        }

        return () => {
            closeConnection();
        };
    }, [isAuthenticated, connectSSE, closeConnection]);

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
            eventSourceRef.current?.readyState === EventSource.OPEN
        ),
    };
}
