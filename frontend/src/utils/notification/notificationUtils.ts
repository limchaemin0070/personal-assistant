// utils/alarm/alarmEvent.utils.ts
import type { AlarmEvent, Alarm } from '@/store/useNotificationStore';
import type { BackendAlarmPayload } from '@/types';

/**
 * 백엔드 알람 페이로드를 프론트엔드 AlarmEvent로 변환
 */
export function mapBackendToAlarmEvent(
    payload: BackendAlarmPayload,
): AlarmEvent {
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

/**
 * 알림 생성
 */
function createNotification(alarm: Alarm): void {
    try {
        const formattedTime = new Date(alarm.time).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
        });

        // eslint-disable-next-line no-new
        new Notification(alarm.title || '알람', {
            body: `${formattedTime} 알람 시간입니다.`,
            icon: '/notification-icon.png',
            tag: `alarm-${alarm.alarm_id}-${alarm.time}`,
            requireInteraction: true,
        } as NotificationOptions & { requireInteraction?: boolean });
    } catch (error) {
        console.error('❌ 알림 생성 실패:', error);
    }
}

/**
 * 알림 권한 요청 및 생성
 */
function requestNotificationPermission(alarm: Alarm): void {
    Notification.requestPermission()
        .then((permission) => {
            if (permission === 'granted') {
                createNotification(alarm);
            }
        })
        .catch((error) => {
            console.error('❌ 알림 권한 요청 실패:', error);
        });
}

/**
 * 브라우저 알림 표시
 */
export function showBrowserNotification(alarm: Alarm): void {
    if (!('Notification' in window)) {
        console.warn('⚠️ 브라우저가 알림을 지원하지 않습니다');
        return;
    }

    if (Notification.permission === 'granted') {
        createNotification(alarm);
    } else if (Notification.permission !== 'denied') {
        requestNotificationPermission(alarm);
    }
}

/**
 * SSE 메시지 데이터 유효성 검사
 */
export function isValidAlarmPayload(
    data: unknown,
): data is BackendAlarmPayload {
    if (!data || typeof data !== 'object') return false;

    const payload = data as Partial<BackendAlarmPayload>;

    return (
        payload.type === 'ALARM_TRIGGER' &&
        payload.data !== undefined &&
        typeof payload.data === 'object' &&
        payload.data !== null
    );
}
