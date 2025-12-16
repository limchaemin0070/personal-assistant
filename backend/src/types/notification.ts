/**
 * 알람 종류 (enum 수준으로 제한)
 * TODO : 알람 타입 구분에 의미가 있는지 체크하고 없을 시 통합...
 * - basic: 월 수 금 반복 알람 등 이벤트와 무관한 기본 알람
 * - event: 특정 이벤트나 일정 등에 부착하여 실행되는 일회성 알람
 */
export type AlarmKind = "basic" | "event";

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
  // 스케줄/리마인더와 무관한 독립 알람을 위해 null/undefined 허용함
  scheduleId?: number | null;
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

/**
 * @deprecated NotificationData는 AlarmData로 대체됨
 * 하위 호환성을 위해 임시 유지
 */
export interface NotificationData {
  alarmId: number;
  userId: number;
  title: string;
  message: string;
  scheduleId?: number | null;
  reminderId?: number | null;
  timestamp: string;
  alarmType: string;
}

// ===================================================================

export interface AlarmJobData {
  type: "SEND_ALARM" | "CHECK_SCHEDULED_ALARMS" | "CLEANUP_OLD_ALARMS";
  data?: {
    alarmId?: number;
    userId?: number;
    message?: string;
    triggerTime?: Date;
  };
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
