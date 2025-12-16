// store/alarmStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Alarm {
    alarm_id: number;
    user_id: number;
    title: string;
    time: string;
    date: string | null;
    is_repeat: boolean;
    repeat_days: number[] | null;
    is_active: boolean;
    alarm_type: 'basic' | 'event';
    next_trigger_at: string;
}

export interface AlarmEvent {
    type: 'alarm_triggered';
    alarm: Alarm;
    timestamp: string;
}

interface AlarmSettings {
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    notificationEnabled: boolean;
    volume: number;
    defaultSnoozeMinutes: number;
}

interface AlarmState {
    // 상태
    activeAlarm: AlarmEvent | null;
    alarmQueue: AlarmEvent[];
    alarmHistory: AlarmEvent[];
    snoozedAlarms: Map<number, ReturnType<typeof setTimeout>>;
    settings: AlarmSettings;
    isPlaying: boolean;

    // SSE 연결 상태
    isConnected: boolean;
    reconnectAttempts: number;

    // 액션
    setActiveAlarm: (alarm: AlarmEvent) => void;
    dismissAlarm: () => void;
    dismissAll: () => void;
    snoozeAlarm: (minutes?: number) => void;
    addToQueue: (alarm: AlarmEvent) => void;
    processNextAlarm: () => void;
    addToHistory: (alarm: AlarmEvent) => void;
    clearHistory: () => void;

    // 설정
    updateSettings: (settings: Partial<AlarmSettings>) => void;
    setVolume: (volume: number) => void;

    // SSE 상태
    setConnected: (connected: boolean) => void;
    setReconnectAttempts: (attempts: number) => void;
}

export const useNotificationStore = create<AlarmState>()(
    persist(
        (set, get) => ({
            // 초기 상태
            activeAlarm: null,
            alarmQueue: [],
            alarmHistory: [],
            snoozedAlarms: new Map(),
            settings: {
                soundEnabled: true,
                vibrationEnabled: true,
                notificationEnabled: true,
                volume: 0.5,
                defaultSnoozeMinutes: 5,
            },
            isPlaying: false,
            isConnected: false,
            reconnectAttempts: 0,

            // 알람 설정
            setActiveAlarm: (alarm) => {
                set({ activeAlarm: alarm, isPlaying: true });
                get().addToHistory(alarm);
            },

            // 알람 해제
            dismissAlarm: () => {
                set({ activeAlarm: null, isPlaying: false });
                get().processNextAlarm();
            },

            // 모든 알람 해제
            dismissAll: () => {
                set({
                    activeAlarm: null,
                    alarmQueue: [],
                    isPlaying: false,
                });
            },

            // 다시 알림
            snoozeAlarm: (minutes) => {
                const { activeAlarm, settings, snoozedAlarms } = get();
                if (!activeAlarm) return;

                const snoozeMinutes = minutes || settings.defaultSnoozeMinutes;
                const alarmId = activeAlarm.alarm.alarm_id;

                // 기존 스누즈 타이머 취소
                const existingTimeout = snoozedAlarms.get(alarmId);
                if (existingTimeout) {
                    clearTimeout(existingTimeout);
                }

                // 새 타이머 설정
                const timeoutId = setTimeout(
                    () => {
                        set({ activeAlarm, isPlaying: true });
                        const newSnoozed = new Map(get().snoozedAlarms);
                        newSnoozed.delete(alarmId);
                        set({ snoozedAlarms: newSnoozed });
                    },
                    snoozeMinutes * 60 * 1000,
                );

                const newSnoozed = new Map(snoozedAlarms);
                newSnoozed.set(alarmId, timeoutId);

                set({
                    activeAlarm: null,
                    isPlaying: false,
                    snoozedAlarms: newSnoozed,
                });

                console.log(`⏰ Snoozed for ${snoozeMinutes} minutes`);
            },

            // 큐에 추가
            addToQueue: (alarm) => {
                set((state) => ({
                    alarmQueue: [...state.alarmQueue, alarm],
                }));

                // 현재 활성 알람이 없으면 바로 처리
                if (!get().activeAlarm) {
                    get().processNextAlarm();
                }
            },

            // 다음 알람 처리
            processNextAlarm: () => {
                const { alarmQueue } = get();
                if (alarmQueue.length > 0) {
                    const [nextAlarm, ...rest] = alarmQueue;
                    set({
                        activeAlarm: nextAlarm,
                        alarmQueue: rest,
                        isPlaying: true,
                    });
                }
            },

            // 히스토리에 추가
            addToHistory: (alarm) => {
                set((state) => ({
                    alarmHistory: [alarm, ...state.alarmHistory].slice(0, 50),
                }));
            },

            // 히스토리 삭제
            clearHistory: () => {
                set({ alarmHistory: [] });
            },

            // 설정 업데이트
            updateSettings: (newSettings) => {
                set((state) => ({
                    settings: { ...state.settings, ...newSettings },
                }));
            },

            // 볼륨 설정
            setVolume: (volume) => {
                set((state) => ({
                    settings: { ...state.settings, volume },
                }));
            },

            // SSE 연결 상태
            setConnected: (connected) => {
                set({ isConnected: connected });
            },

            // 재연결 시도 횟수
            setReconnectAttempts: (attempts) => {
                set({ reconnectAttempts: attempts });
            },
        }),
        {
            name: 'alarm-storage',
            partialize: (state) => ({
                // localStorage에 저장할 것만 선택
                settings: state.settings,
                alarmHistory: state.alarmHistory.slice(0, 20), // 최근 20개만
            }),
        },
    ),
);
