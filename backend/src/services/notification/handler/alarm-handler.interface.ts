import { AlarmData, AlarmJobData } from "../../../types/notification";

/**
 * 알람 타입별 처리 인터페이스
 * 각 알람 타입(Alarm, ReminderAlarm 등)은 이 인터페이스를 구현
 */
export interface AlarmHandler<T> {
  /**
   * 알람 타입 식별자 (예: "alarm", "reminderAlarm")
   */
  readonly alarmType: string;
  // === 검증 ===
  canTrigger(alarm: T): boolean;
  shouldReschedule(alarm: T): boolean;

  // === 스케줄링 ===
  calculateNextTriggerTime(alarm: T, currentTime?: Date): Date | null;
  createJobData(alarm: T): AlarmJobData;
  // createJobOptions(alarm: T): AlarmJobOptions;

  // === 데이터 변환 ===
  buildAlarmData(alarm: T): AlarmData;

  // === DB 작업 ===
  completeAlarm(alarm: T): Promise<void>;
  updateNextTriggerTime(alarm: T, nextTime: Date | null): Promise<void>;
  findById(alarmId: number): Promise<T | null>;

  // === 유틸리티 ===
  getAlarmId(alarm: T): number;
  getUserId(alarm: T): number;
}
