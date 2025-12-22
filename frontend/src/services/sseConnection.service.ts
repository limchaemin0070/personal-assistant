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

    private isReconnecting: boolean = false;

    private reconnectAttempts: number = 0;

    private readonly baseURL: string;

    private readonly config: SSEConfig;

    private handlers: SSEEventHandlers;

    private readonly MAX_RECONNECT_ATTEMPTS = 10;

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

        // 재연결 중이면 취소
        if (this.isReconnecting) {
            console.log('⚠️ 재연결 진행 중 - 새 연결 시도 취소');
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout);
                this.reconnectTimeout = null;
            }
            this.isReconnecting = false;
        }

        this.disconnect();
        this.reconnectAttempts = 0; // 연결 성공 시 재시도 횟수 리셋
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
            this.isReconnecting = false;
            this.reconnectAttempts = 0; // 연결 성공 시 재시도 횟수 리셋
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
            const readyState = this.eventSource?.readyState;

            // EventSource의 readyState:
            // 0 = CONNECTING
            // 1 = OPEN
            // 2 = CLOSED

            // 연결이 닫혔거나 연결 실패한 경우에만 재연결 시도
            if (readyState === EventSource.CLOSED) {
                console.error('❌ SSE 연결 종료됨 - 재연결 시도');
                this.disconnect();
                this.scheduleReconnect();
            } else if (readyState === EventSource.CONNECTING) {
                // 연결 시도 중인 경우는 잠시 대기 (EventSource가 자동으로 재시도)
                console.log('⏳ SSE 연결 시도 중...');
            } else {
                // 기타 에러는 로그만 남기고 재연결하지 않음
                console.warn(
                    '⚠️ SSE 에러 발생 (재연결 안 함):',
                    error,
                    'readyState:',
                    readyState,
                );
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
        // 이미 재연결 중이면 중복 방지
        if (this.isReconnecting) {
            console.log('⚠️ 이미 재연결 진행 중 - 중복 시도 방지');
            return;
        }

        // 최대 재연결 시도 횟수 초과 시 중단
        if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
            console.error(
                `❌ SSE 재연결 시도 횟수 초과 (${this.MAX_RECONNECT_ATTEMPTS}회) - 재연결 중단`,
            );
            this.handlers.onError();
            return;
        }

        // 기존 타임아웃 취소
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        this.reconnectAttempts += 1;
        this.isReconnecting = true;

        const delay = Math.min(
            this.config.RECONNECT_DELAY * 2 ** this.reconnectAttempts,
            60000,
        );
        console.log(
            `SSE 재연결 시도 ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS} (${delay / 1000}초 후) `,
        );

        this.reconnectTimeout = setTimeout(() => {
            this.isReconnecting = false;
            this.reconnectTimeout = null;

            // 토큰이 있으면 재연결 시도
            if (this.connectedToken) {
                console.log('🔄 재연결 시도 시작...');
                this.connect(this.connectedToken);
            } else {
                console.error('❌ 재연결 시도 실패 - 토큰 없음');
                this.handlers.onError();
            }
        }, delay);
    }

    /**
     * SSE 연결 종료
     */
    disconnect(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }

        // 재연결 타임아웃 취소
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        // 재연결 상태 리셋
        this.isReconnecting = false;
        this.reconnectAttempts = 0;

        // 토큰은 유지 (재연결 시 사용)
        // -> 변경됨 이제는재연결 시 동일 토큰 사용
        // this.connectedToken = null;

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
     * 핸들러 업데이트 (필요시)
     */
    updateHandlers(handlers: Partial<SSEEventHandlers>): void {
        this.handlers = { ...this.handlers, ...handlers };
    }
}
