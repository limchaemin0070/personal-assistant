/**
 * Redis 키 네이밍 상수
 */
export const REDIS_KEYS = {
  /**
   * 알람 스케줄 Sorted Set 키
   * score: timestamp, value: alarmId
   */
  ALARM_SCHEDULE: "alarm:schedule",

  /**
   * 알람 메타데이터 Hash 키 생성 함수
   * @param alarmId 알람 ID
   * @returns Redis 키 (예: "alarm:meta:123")
   */
  alarmMeta: (alarmId: number | string): string => `alarm:meta:${alarmId}`,

  /**
   * 알람 트리거 Pub/Sub 채널 키 생성 함수
   * @param userId 사용자 ID
   * @returns Redis 채널 키 (예: "alarm:trigger:user:456")
   */
  alarmTriggerChannel: (userId: number | string): string =>
    `alarm:trigger:user:${userId}`,

  /**
   * 알람 히스토리 List 키 생성 함수
   * @param userId 사용자 ID
   * @returns Redis 키 (예: "alarm:history:456")
   */
  alarmHistory: (userId: number | string): string => `alarm:history:${userId}`,
} as const;

/**
 * BullMQ 큐 관련 상수
 */
export const QUEUE_CONSTANTS = {
  /**
   * 알람 큐 이름
   */
  ALARM_QUEUE_NAME: "alarms",

  /**
   * 알람 Job ID 생성 함수
   * @param alarmId 알람 ID
   * @returns Job ID (예: "alarm-123")
   */
  alarmJobId: (alarmId: number | string): string => `alarm-${alarmId}`,

  /**
   * Job 타입 상수
   */
  JOB_TYPES: {
    SEND_ALARM: "SEND_ALARM",
    CHECK_SCHEDULED_ALARMS: "CHECK_SCHEDULED_ALARMS",
    CLEANUP_OLD_ALARMS: "CLEANUP_OLD_ALARMS",
  } as const,
} as const;
