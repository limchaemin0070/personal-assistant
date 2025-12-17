// hooks/useAlarmSSE.ts
import { useCallback, useEffect, useRef } from 'react';
import {
    useNotificationStore,
    type AlarmEvent,
    type Alarm,
} from '@/store/useNotificationStore';
import { playNotificationSound } from '@/utils/notification/playNotificationSound';

type BackendAlarmData = {
    alarmId: number;
    userId: number;
    title: string;
    message: string;
    scheduleId?: number | null;
    reminderId?: number | null;
    timestamp: string;
    alarmKind: 'repeat' | 'once'; // 백엔드에서 alarmKind로 전송됨
};

type BackendAlarmPayload = {
    type: 'ALARM_TRIGGER';
    data: BackendAlarmData;
};

function mapBackendToAlarmEvent(payload: BackendAlarmPayload): AlarmEvent {
    const { data } = payload;

    const alarm: Alarm = {
        alarm_id: data.alarmId,
        user_id: data.userId,
        title: data.title,
        // 백엔드에서 별도의 time 필드를 주지 않으므로, 트리거 시각을 time으로 사용
        time: data.timestamp,
        date: null,
        is_repeat: data.alarmKind === 'repeat',
        repeat_days: null,
        is_active: true,
        alarm_type: data.alarmKind, // 'repeat' | 'once'
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
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );

    const {
        setActiveAlarm,
        addToQueue,
        activeAlarm,
        settings,
        setConnected,
        reconnectAttempts,
        setReconnectAttempts,
    } = useNotificationStore();

    const handleAlarmEvent = useCallback(
        (event: AlarmEvent) => {
            console.log('⏰ [알람 트리거] 알람 이벤트 처리 시작:', event);
            console.log('📊 [알람 트리거] 현재 활성 알람 상태:', activeAlarm);

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
            } else {
                console.log('🔇 [알람 트리거] 알림 소리 비활성화됨');
            }

            if (settings.notificationEnabled) {
                console.log('📱 [알람 트리거] 브라우저 알림 표시');
                showBrowserNotification(event.alarm);
            } else {
                console.log('📵 [알람 트리거] 브라우저 알림 비활성화됨');
            }
        },
        [activeAlarm, addToQueue, setActiveAlarm, settings],
    );

    const connect = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        console.log('Connecting to Alarm SSE...');

        const baseURL = import.meta.env.VITE_SERVER_URL;
        const eventSource = new EventSource(`${baseURL}/notification/stream`, {
            withCredentials: true,
        });

        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            console.log('✅ Alarm SSE connected');
            setConnected(true);
            setReconnectAttempts(0);

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        };

        eventSource.addEventListener('alarm', (rawEvent) => {
            try {
                console.log('🔔 [알람 트리거] 원본 이벤트 수신:', rawEvent);

                const eventData = (rawEvent as MessageEvent).data;

                // null 또는 빈 데이터 체크
                if (
                    !eventData ||
                    eventData === 'null' ||
                    eventData.trim() === ''
                ) {
                    console.warn(
                        '⚠️ [알람 트리거] 빈 데이터 또는 null 수신, 무시합니다:',
                        eventData,
                    );
                    return;
                }

                const message = JSON.parse(eventData) as BackendAlarmPayload;

                console.log('📨 [알람 트리거] 파싱된 메시지:', message);

                // null 체크 추가
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
                console.log('📋 [알람 트리거] 알람 상세 정보:', {
                    alarm_id: alarmEvent.alarm.alarm_id,
                    title: alarmEvent.alarm.title,
                    time: alarmEvent.alarm.time,
                    alarm_type: alarmEvent.alarm.alarm_type,
                    timestamp: alarmEvent.timestamp,
                });

                handleAlarmEvent(alarmEvent);
            } catch (error) {
                console.error('❌ [알람 트리거] 이벤트 파싱 실패:', error);
            }
        });

        // 백엔드에서 event: ping 으로 하트비트 전송
        eventSource.addEventListener('ping', () => {
            console.log('💓 SSE ping received');
        });

        eventSource.onerror = (error) => {
            console.error('❌ SSE error:', error);
            setConnected(false);

            if (eventSource.readyState === EventSource.CLOSED) {
                console.log('SSE connection closed');
            }

            // 지수 백오프로 재연결 시도
            if (!reconnectTimeoutRef.current) {
                const nextAttempts = reconnectAttempts + 1;
                setReconnectAttempts(nextAttempts);

                const delay = Math.min(30000, 1000 * 2 ** (nextAttempts - 1));

                console.log(`🔁 Reconnecting SSE in ${delay}ms...`);
                reconnectTimeoutRef.current = setTimeout(() => {
                    reconnectTimeoutRef.current = null;
                    connect();
                }, delay);
            }
        };
    }, [
        handleAlarmEvent,
        reconnectAttempts,
        setConnected,
        setReconnectAttempts,
    ]);

    useEffect(() => {
        connect();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect]);

    const reconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        setReconnectAttempts(0);
        connect();
    }, [connect, setReconnectAttempts]);

    return { reconnect };
}
