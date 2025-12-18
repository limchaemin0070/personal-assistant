export type AlarmKind = 'repeat' | 'once';

export type BackendAlarmData = {
    alarmId: number;
    userId: number;
    title: string;
    message: string;
    scheduleId?: number | null;
    reminderId?: number | null;
    timestamp: string;
    alarmKind: AlarmKind;
};

export type BackendAlarmPayload = {
    type: 'ALARM_TRIGGER';
    data: BackendAlarmData;
};

export type SSETokenData = {
    sseToken: string;
    expiresIn: number;
    expiresAt: number;
};

export type SSEConfig = {
    RECONNECT_DELAY: number;
};

export type SSEConnectionState = {
    isConnected: boolean;
    reconnectAttempts: number;
};
