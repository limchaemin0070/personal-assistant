/**
 * 알람의 대분류
 * 어떤 테이블의 알람인지
 */
export enum AlarmType {
  ALARM = "alarm",
  REMINDER_ALARM = "reminderAlarm",
  // 추후 필요할 시 더 확장...
}

/**
 * 알람의 동작 방식
 * - repeat: 반복 알람 (월 수 금 반복 알람 등)
 * - once: 일회성 알람 (특정 이벤트나 일정 등에 부착하여 실행되는 알람)
 */
export type AlarmKind = "repeat" | "once";

/**
 * 알람 데이터 DTO
 * 도메인 모델(Alarm)에서 변환된 데이터 구조
 * buildAlarmData 함수가 반환하는 타입
 */
export interface AlarmData {
  alarmId: number;
  userId: number;
  title: string;
  message: string;
  // 리마인더와 무관한 독립 알람을 위해 null/undefined 허용함
  reminderId?: number | null;
  timestamp: string;
  alarmKind: AlarmKind;
}

/**
 * 알람 전송 페이로드 (SSE/Redis로 나가는 전송 DTO)
 * 네트워크 전송을 위한 최종 데이터 구조
 */
export interface AlarmTransportPayload {
  type: "ALARM_TRIGGER";
  data: AlarmData;
}

// ===================================================================

export interface AlarmJobData {
  alarmType?: AlarmType; // 뭔 알람인지...
  alarmId?: number;
  reminderAlarmId?: number; // 리마인더 알람인 경우 사용
  userId?: number;
  message?: string;
  triggerTime?: Date;
}

export interface SSEMessage {
  type: "ALARM" | "CONNECTED" | "HEARTBEAT";
  data?: any;
  timestamp?: Date;
}

export interface ScheduledAlarm {
  id: number;
  userId: number;
  message: string;
  triggerTime: Date;
  status: "PENDING" | "SENT" | "FAILED";
}
