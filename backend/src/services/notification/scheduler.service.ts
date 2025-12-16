import { redisClient, redisPublisher } from "../../config/redis";
import cron from "node-cron";
import { Alarm } from "../../models";
import { TimeCalculator } from "../../utils/notification/timeCalculator";
import { REDIS_KEYS } from "../../constants/redis-keys";
import notificationService from "./notification.service";

class SchedulerService {
  private isInitialized = false;

  // 초기화
  async initialize() {
    if (this.isInitialized) return;

    try {
      this.startScheduler();

      this.isInitialized = true;
      console.log("═══════════════════════════════════════");
      console.log(`✅ Redis 스케줄러 초기화 완료`);
      console.log("═══════════════════════════════════════\n");
    } catch (error) {
      console.error("❌ Redis 스케줄러 초기화 실패:", error);
      throw error;
    }
  }

  // 알람 스케줄러 시작
  private startScheduler() {
    cron.schedule("* * * * *", async () => {
      await this.checkAndTriggerAlarms();
    });
  }

  // 알람 스케줄링 시작
  async scheduleAlarm(alarm: Alarm): Promise<void> {
    try {
      const repeatDays = this.normalizeRepeatDays(alarm.repeat_days);

      // 반복하지 않는 일회성 알람 -> return
      if (!alarm.is_repeat || repeatDays.length === 0) {
        return;
      }

      // 반복 알람일 경우 다음 트리거 시간을 계산
      const nextTriggerTime = TimeCalculator.calculateNextTriggerTime(
        alarm.time,
        repeatDays,
        new Date()
      );

      // 시간 계산 에러
      if (!nextTriggerTime) {
        return;
      }

      // Redis Sorted Set에 추가 (score = timestamp)
      await redisClient.zadd(
        REDIS_KEYS.ALARM_SCHEDULE,
        nextTriggerTime.getTime(),
        alarm.alarm_id.toString()
      );

      // 메타데이터 저장 (영구 저장)
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

      // MySQL에 다음 실행 시간 저장
      await alarm.update({ next_trigger_at: nextTriggerTime });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 알람 체크 및 트리거 (매분 실행)
   */
  private async checkAndTriggerAlarms() {
    try {
      const now = Date.now();

      // 현재 시간까지의 모든 알람 조회 (Sorted Set)
      const alarmIds = await redisClient.zrangebyscore(
        REDIS_KEYS.ALARM_SCHEDULE,
        0,
        now
      );

      if (alarmIds.length === 0) {
        return;
      }

      for (const alarmIdStr of alarmIds) {
        const alarmId = parseInt(alarmIdStr);

        try {
          await this.processAlarm(alarmId, now);
        } catch (error) {
          // 에러 처리
        }
      }
    } catch (error) {
      // 에러 처리
    }
  }

  /**
   * 알람 개별 처리
   */
  private async processAlarm(alarmId: number, currentTime: number) {
    // 1. MySQL에서 알람 조회
    const alarm = await Alarm.findByPk(alarmId);

    if (!alarm || !alarm.is_active) {
      await redisClient.zrem(REDIS_KEYS.ALARM_SCHEDULE, alarmId.toString());
      await redisClient.del(REDIS_KEYS.alarmMeta(alarmId));
      return;
    }

    const repeatDays = this.normalizeRepeatDays(alarm.repeat_days);
    if (!alarm.is_repeat || repeatDays.length === 0) {
      await redisClient.zrem(REDIS_KEYS.ALARM_SCHEDULE, alarmId.toString());
      await redisClient.del(REDIS_KEYS.alarmMeta(alarmId));
      return;
    }

    // 2. 알림 발송
    await notificationService.sendNotification(alarm);

    // 3. 다음 실행 시간 계산
    const nextTriggerTime = TimeCalculator.calculateNextTriggerTime(
      alarm.time,
      repeatDays,
      new Date(currentTime)
    );

    if (nextTriggerTime) {
      // 4. Sorted Set 업데이트
      await redisClient.zadd(
        REDIS_KEYS.ALARM_SCHEDULE,
        nextTriggerTime.getTime(),
        alarmId.toString()
      );

      // 5. MySQL 업데이트
      await alarm.update({
        last_triggered_at: new Date(),
        next_trigger_at: nextTriggerTime,
        trigger_count: alarm.trigger_count + 1,
      });
    } else {
      // 더 이상 반복 없음
      await redisClient.zrem(REDIS_KEYS.ALARM_SCHEDULE, alarmId.toString());
      await alarm.update({ is_active: false });
    }
  }

  /**
   * 알람 취소
   */
  async cancelAlarm(alarm: Alarm): Promise<void> {
    try {
      await redisClient.zrem(
        REDIS_KEYS.ALARM_SCHEDULE,
        alarm.alarm_id.toString()
      );

      await redisClient.del(REDIS_KEYS.alarmMeta(alarm.alarm_id));
    } catch (error) {
      throw error;
    }
  }

  /**
   * TODO : Zod에서 처리하거나 다른 곳에서 변환하도록 변경
   * DB에 문자열로 저장된 repeat_days를 number[]로 변환
   * 예: "[0,1,2]" -> [0,1,2]
   */
  private normalizeRepeatDays(
    repeatDays: string | number[] | null | undefined
  ): number[] {
    if (Array.isArray(repeatDays)) {
      return repeatDays.filter((v) => typeof v === "number");
    }

    if (typeof repeatDays === "string") {
      try {
        const parsed = JSON.parse(repeatDays);
        return Array.isArray(parsed)
          ? parsed.filter((v) => typeof v === "number")
          : [];
      } catch {
        return [];
      }
    }

    return [];
  }
}

export const schedulerService = new SchedulerService();
