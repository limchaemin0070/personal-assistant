import { redisClient } from "../../config/redis";
import { Alarm } from "../../models";
import { REDIS_KEYS } from "../../constants/redis-keys";
import { normalizeRepeatDays } from "../../utils/alarm/alarmUtils";

/**
 * Redis 스케줄 관리 전용 서비스
 * 책임: 알람 스케줄의 등록/취소/조회만 담당
 */
class AlarmSchedulerService {
  /**
   * 특정 시간에 알람 스케줄 등록
   */
  async scheduleAlarmAt(alarmId: number, triggerTime: Date): Promise<void> {
    await redisClient.zadd(
      REDIS_KEYS.ALARM_SCHEDULE,
      triggerTime.getTime(),
      alarmId.toString()
    );
  }

  /**
   * 알람 메타데이터 저장
   */
  async saveAlarmMetadata(alarm: Alarm): Promise<void> {
    const repeatDays = normalizeRepeatDays(alarm.repeat_days);

    await redisClient.hmset(
      REDIS_KEYS.alarmMeta(alarm.alarm_id),
      "userId",
      alarm.user_id.toString(),
      "title",
      alarm.title || "",
      "alarmType",
      alarm.alarm_type,
      "time",
      alarm.time,
      "isRepeat",
      alarm.is_repeat ? "1" : "0",
      "repeatDays",
      JSON.stringify(repeatDays),
      "isActive",
      alarm.is_active ? "1" : "0"
    );
  }

  /**
   * 스케줄에서 알람 제거
   */
  async removeAlarmFromSchedule(alarmId: number): Promise<void> {
    await redisClient.zrem(REDIS_KEYS.ALARM_SCHEDULE, alarmId.toString());
    await redisClient.del(REDIS_KEYS.alarmMeta(alarmId));
  }

  /**
   * 알람 취소 (스케줄에서 제거)
   */
  async cancelAlarm(alarm: Alarm): Promise<void> {
    await this.removeAlarmFromSchedule(alarm.alarm_id);
  }

  /**
   * 현재 시간까지의 모든 알람 ID 조회
   */
  async getDueAlarmIds(untilTime: number = Date.now()): Promise<number[]> {
    const alarmIds = await redisClient.zrangebyscore(
      REDIS_KEYS.ALARM_SCHEDULE,
      0,
      untilTime
    );

    return alarmIds.map((id) => parseInt(id));
  }

  /**
   * 알람 메타데이터 조회
   */
  async getAlarmMetadata(
    alarmId: number
  ): Promise<Record<string, string> | null> {
    const metadata = await redisClient.hgetall(REDIS_KEYS.alarmMeta(alarmId));
    return Object.keys(metadata).length > 0 ? metadata : null;
  }
}

export const alarmSchedulerService = new AlarmSchedulerService();
