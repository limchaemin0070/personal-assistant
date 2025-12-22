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

type TokenProvider = () => Promise<string | null>;

export class SSEConnectionService {
    private eventSource: EventSource | null = null;

    private connectedToken: string | null = null;

    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    private reconnectAttempts: number = 0;

    private readonly baseURL: string;

    private readonly config: SSEConfig;

    private readonly getToken: TokenProvider;

    private readonly MAX_RECONNECT_ATTEMPTS = 10;

    private handlers: SSEEventHandlers;

    constructor(
        baseURL: string,
        config: SSEConfig,
        handlers: SSEEventHandlers,
        getToken: TokenProvider,
    ) {
        this.baseURL = baseURL;
        this.config = config;
        this.handlers = handlers;
        this.getToken = getToken;
    }

    /**
     * SSE 연결 시작
     */
    connect(token: string): void {
        if (!token) {
            console.error('❌ SSE 연결 시도 실패 - 토큰 없음');
            return;
        }

        if (this.isConnectedWithToken(token)) {
            console.log('✅ 이미 동일한 토큰으로 연결되어 있음');
            return;
        }

        this.cancelReconnect();
        this.disconnect();
        this.reconnectAttempts = 0;

        console.log('🔌 SSE 새로운 연결 시도...');

        const url = `${this.baseURL}/notification/stream?token=${encodeURIComponent(token)}`;
        this.eventSource = new EventSource(url, { withCredentials: true });
        this.connectedToken = token;

        this.setupEventListeners();
    }

    /**
     * SSE 연결 종료
     */
    disconnect(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.cancelReconnect();
        console.log('🔌 SSE 연결 종료');
    }

    /**
     * 완전히 연결 종료 (토큰까지 제거)
     */
    disconnectCompletely(): void {
        this.disconnect();
        this.connectedToken = null;
    }

    /**
     * 핸들러 업데이트
     */
    updateHandlers(handlers: Partial<SSEEventHandlers>): void {
        this.handlers = { ...this.handlers, ...handlers };
    }

    /**
     * SSE 연결 상태 확인
     */
    private isConnected(): boolean {
        return this.eventSource?.readyState === EventSource.OPEN;
    }

    /**
     * 현재 연결된 토큰과 비교
     */
    private isConnectedWithToken(token: string): boolean {
        return this.isConnected() && this.connectedToken === token;
    }

    /**
     * 이벤트 리스너 설정
     */
    private setupEventListeners(): void {
        if (!this.eventSource) return;

        this.eventSource.onopen = () => {
            console.log('✅ SSE 연결 성공');
            this.reconnectAttempts = 0;
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

        this.eventSource.onerror = () => {
            if (this.eventSource?.readyState === EventSource.CLOSED) {
                console.error('❌ SSE 연결 종료됨 - 재연결 시도');
                this.disconnect();
                this.scheduleReconnect();
            }
        };
    }

    /**
     * 알람 이벤트 처리
     */
    private handleAlarmEvent(rawEvent: MessageEvent): void {
        try {
            console.log('🔔 [알람 트리거] 원본 이벤트 수신:', rawEvent);

            const eventData = rawEvent.data;

            if (!eventData || eventData === 'null' || eventData.trim() === '') {
                console.warn('⚠️ [알람 트리거] 빈 데이터 수신');
                return;
            }

            const message: unknown = JSON.parse(eventData);

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
     * 재연결 취소
     */
    private cancelReconnect(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }

    /**
     * 재연결 스케줄링
     */
    private scheduleReconnect(): void {
        if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
            console.error(
                `❌ SSE 재연결 시도 횟수 초과 (${this.MAX_RECONNECT_ATTEMPTS}회) - 재연결 중단`,
            );
            this.handlers.onError();
            return;
        }

        this.reconnectAttempts += 1;

        const delay = Math.min(
            this.config.RECONNECT_DELAY * 2 ** this.reconnectAttempts,
            60000,
        );

        console.log(
            `🔄 SSE 재연결 시도 ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS} (${delay / 1000}초 후)`,
        );

        this.reconnectTimeout = setTimeout(async () => {
            this.reconnectTimeout = null;
            const token = await this.getToken();

            if (token) {
                console.log('✅ 최신 토큰 획득 - 재연결 시도');
                this.connect(token);
            } else {
                console.error('❌ 재연결 시도 실패 - 토큰 발급 실패');
                this.handlers.onError();
            }
        }, delay);
    }
}
