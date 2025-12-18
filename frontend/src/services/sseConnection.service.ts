// services/sseConnection.service.ts
import type { AlarmEvent } from '@/store/useNotificationStore';
import type { SSEConfig, BackendAlarmPayload } from '@/types';
import {
    isValidAlarmPayload,
    mapBackendToAlarmEvent,
} from '@/utils/notification/notificationUtils';

type SSEEventHandlers = {
    onAlarm: (event: AlarmEvent) => void;
    onConnected: () => void;
    onError: () => void;
};

export class SSEConnectionService {
    private eventSource: EventSource | null = null;

    private connectedToken: string | null = null;

    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    private readonly baseURL: string;

    private readonly config: SSEConfig;

    private handlers: SSEEventHandlers;

    constructor(
        baseURL: string,
        config: SSEConfig,
        handlers: SSEEventHandlers,
    ) {
        this.baseURL = baseURL;
        this.config = config;
        this.handlers = handlers;
    }

    /**
     * SSE 연결 상태 확인
     */
    isConnected(): boolean {
        return (
            this.eventSource !== null &&
            this.eventSource.readyState === EventSource.OPEN
        );
    }

    /**
     * 현재 연결된 토큰과 비교
     */
    isConnectedWithToken(token: string): boolean {
        return this.isConnected() && this.connectedToken === token;
    }

    /**
     * SSE 연결 시작
     */
    connect(token: string): void {
        if (!token) {
            console.error('❌ SSE 연결 시도 실패 - 토큰 없음');
            return;
        }

        // 이미 동일한 토큰으로 연결되어 있으면 재연결 불필요
        if (this.isConnectedWithToken(token)) {
            console.log('✅ 이미 동일한 토큰으로 연결되어 있음');
            return;
        }

        this.disconnect();
        console.log('🔌 SSE 새로운 연결 시도...');

        const url = `${this.baseURL}/notification/stream?token=${encodeURIComponent(token)}`;
        const eventSource = new EventSource(url, { withCredentials: true });

        this.eventSource = eventSource;
        this.connectedToken = token;

        this.setupEventListeners();
    }

    /**
     * 이벤트 리스너 설정
     */
    private setupEventListeners(): void {
        if (!this.eventSource) return;

        this.eventSource.onopen = () => {
            console.log('✅ SSE 연결 성공');
            this.handlers.onConnected();
        };

        this.eventSource.addEventListener('connected', (rawEvent) => {
            try {
                const data = JSON.parse((rawEvent as MessageEvent).data);
                console.log('✅ SSE 인증 완료:', data);
            } catch (error) {
                console.error('❌ 연결 이벤트 파싱 실패:', error);
            }
        });

        this.eventSource.addEventListener('alarm', (rawEvent) => {
            this.handleAlarmEvent(rawEvent as MessageEvent);
        });

        this.eventSource.addEventListener('ping', () => {
            console.log('💓 SSE ping received');
        });

        this.eventSource.onerror = (error) => {
            console.error('❌ SSE error:', error);
            this.disconnect();
            this.scheduleReconnect();
        };
    }

    /**
     * 알람 이벤트 처리
     */
    private handleAlarmEvent(rawEvent: MessageEvent): void {
        try {
            console.log('🔔 [알람 트리거] 원본 이벤트 수신:', rawEvent);

            const eventData = rawEvent.data;

            // 빈 데이터 체크
            if (!eventData || eventData === 'null' || eventData.trim() === '') {
                console.warn('⚠️ [알람 트리거] 빈 데이터 수신');
                return;
            }

            const message: unknown = JSON.parse(eventData);

            // 메시지 유효성 검사
            if (!isValidAlarmPayload(message)) {
                console.warn('⚠️ [알람 트리거] 잘못된 메시지 형식:', message);
                return;
            }

            const alarmEvent = mapBackendToAlarmEvent(
                message as BackendAlarmPayload,
            );
            console.log('⏰ [알람 트리거] 변환된 알람 이벤트:', alarmEvent);

            this.handlers.onAlarm(alarmEvent);
        } catch (error) {
            console.error('❌ [알람 트리거] 이벤트 파싱 실패:', error);
        }
    }

    /**
     * 재연결 스케줄링
     */
    private scheduleReconnect(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        console.log(
            `🔄 SSE 재연결 시도 (${this.config.RECONNECT_DELAY / 1000}초 후)...`,
        );

        this.reconnectTimeout = setTimeout(() => {
            this.handlers.onError();
        }, this.config.RECONNECT_DELAY);
    }

    /**
     * SSE 연결 종료
     */
    disconnect(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }

        this.connectedToken = null;

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        console.log('🔌 SSE 연결 종료');
    }

    /**
     * 핸들러 업데이트 (필요시)
     */
    updateHandlers(handlers: Partial<SSEEventHandlers>): void {
        this.handlers = { ...this.handlers, ...handlers };
    }
}
