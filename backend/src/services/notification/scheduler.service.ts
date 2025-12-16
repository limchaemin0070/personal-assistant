import { redisClient, redisPublisher } from "../../config/redis";
import cron from "node-cron";
import { Alarm } from "../../models";
import { TimeCalculator } from "../../utils/notification/timeCalculator";
import notificationService from "./notification.service";

class SchedulerService {
  private isInitialized = false;

  // 초기화
  async initialize() {
    if (this.isInitialized) return;

    try {
      // 1. Keyspace Notifications 구독 (Event 알람용)
      //   await this.subscribeToExpiredEvents();

      // 2. Basic 알람 스케줄러 시작 (매분 실행)
      this.startBasicScheduler();

      this.isInitialized = true;
      console.log("═══════════════════════════════════════");
      console.log(`✅ Redis 스케줄러 초기화 완료`);
      console.log("═══════════════════════════════════════\n");
    } catch (error) {
      console.error("❌ Redis 스케줄러 초기화 실패:", error);
      throw error;
    }
  }

  // ==================== Event 알람 (일회성 알람 : 리마인더나 일정이나 날짜알람) ====================
  // TODO : 리마인더 알람 구현
  private async subscribeToExpiredEvents() {}

  private async handleEventAlarmExpired(alarmId: number) {}

  async scheduleEventAlarm(alarm: Alarm): Promise<void> {}

  //   private calculateEventTriggerTime(alarm: Alarm): Date {}

  // ==================== Basic 알람 (요일 반복) ====================

  // 알람 스케줄러 시작
  private startBasicScheduler() {
    cron.schedule("* * * * *", async () => {
      await this.checkAndTriggerBasicAlarms();
    });

    // logger.success("Basic 알람 스케줄러 시작 (매분 실행)");
  }

  // Basic 타입 알람 스케줄링 시작
  async scheduleBasicAlarm(alarm: Alarm): Promise<void> {
    try {
      const repeatDays = this.normalizeRepeatDays(alarm.repeat_days);

      // 반복하지 않는 일회성 알람 -> return
      // TODO : 반복 알림인지 체크하는 간단한 벨리데이터 함수?
      if (!alarm.is_repeat || repeatDays.length === 0) {
        // logger.warn(`반복 설정 없음: ${alarm.alarm_id}`);
        return;
      }

      // 반복 알람일 경우 다음 트리거 시간을 계산
      // TODO : 계산하는 유틸함수 작성
      const nextTriggerTime = TimeCalculator.calculateBasicNextTriggerTime(
        alarm.time,
        repeatDays,
        new Date()
      );

      // 시간 계산 에러
      if (!nextTriggerTime) {
        // logger.warn(`다음 실행 시간 계산 불가: ${alarm.alarm_id}`);
        return;
      }

      // Redis Sorted Set에 추가 (score = timestamp)
      await redisClient.zadd(
        "alarm:basic:schedule",
        nextTriggerTime.getTime(),
        alarm.alarm_id.toString()
      );

      // 메타데이터 저장 (영구 저장)
      await redisClient.hmset(
        `alarm:meta:${alarm.alarm_id}`,
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

      //   logger.success(
      //     `Basic 알람 스케줄: ${alarm.alarm_id}, 다음 실행: ${nextTriggerTime.toLocaleString("ko-KR")}`
      //   );
    } catch (error) {
      //   logger.error("Basic 알람 스케줄 실패:", error);
      throw error;
    }
  }

  /**
   * Basic 알람 체크 및 트리거 (매분 실행)
   */
  private async checkAndTriggerBasicAlarms() {
    try {
      const now = Date.now();

      // 현재 시간까지의 모든 알람 조회 (Sorted Set)
      const alarmIds = await redisClient.zrangebyscore(
        "alarm:basic:schedule",
        0,
        now
      );

      if (alarmIds.length === 0) {
        return;
      }

      //   logger.info(`Basic 알람 ${alarmIds.length}개 트리거 예정`);

      for (const alarmIdStr of alarmIds) {
        const alarmId = parseInt(alarmIdStr);

        try {
          await this.processBasicAlarm(alarmId, now);
        } catch (error) {
          //   logger.error(`Basic 알람 처리 실패: ${alarmId}`, error);
        }
      }
    } catch (error) {
      //   logger.error("Basic 알람 체크 실패:", error);
    }
  }

  /**
   * Basic 알람 개별 처리
   */
  private async processBasicAlarm(alarmId: number, currentTime: number) {
    // 1. MySQL에서 알람 조회
    const alarm = await Alarm.findByPk(alarmId);

    if (!alarm || !alarm.is_active) {
      //   logger.info(`비활성 알람 제거: ${alarmId}`);
      await redisClient.zrem("alarm:basic:schedule", alarmId.toString());
      await redisClient.del(`alarm:meta:${alarmId}`);
      return;
    }

    const repeatDays = this.normalizeRepeatDays(alarm.repeat_days);
    if (!alarm.is_repeat || repeatDays.length === 0) {
      await redisClient.zrem("alarm:basic:schedule", alarmId.toString());
      await redisClient.del(`alarm:meta:${alarmId}`);
      return;
    }

    // 2. 알람 트리거
    await notificationService.triggerAlarm(alarm);

    // 3. 다음 실행 시간 계산
    const nextTriggerTime = TimeCalculator.calculateBasicNextTriggerTime(
      alarm.time,
      repeatDays,
      new Date(currentTime)
    );

    if (nextTriggerTime) {
      // 4. Sorted Set 업데이트
      await redisClient.zadd(
        "alarm:basic:schedule",
        nextTriggerTime.getTime(),
        alarmId.toString()
      );

      // 5. MySQL 업데이트
      await alarm.update({
        last_triggered_at: new Date(),
        next_trigger_at: nextTriggerTime,
        trigger_count: alarm.trigger_count + 1,
      });

      //   logger.success(
      //     `Basic 알람 재스케줄: ${alarmId}, 다음: ${nextTriggerTime.toLocaleString(
      //       "ko-KR"
      //     )}`
      //   );
    } else {
      // 더 이상 반복 없음 (이런 경우는 거의 없음)
      await redisClient.zrem("alarm:basic:schedule", alarmId.toString());
      await alarm.update({ is_active: false });
      //   logger.info(`Basic 알람 종료: ${alarmId}`);
    }
  }

  // ==================== 공통 ====================
  /**
   * 알람 취소
   */
  async cancelAlarm(alarm: Alarm): Promise<void> {
    try {
      if (alarm.alarm_type === "event") {
        await redisClient.del(`alarm:event:${alarm.alarm_id}`);
      } else {
        await redisClient.zrem(
          "alarm:basic:schedule",
          alarm.alarm_id.toString()
        );
      }

      await redisClient.del(`alarm:meta:${alarm.alarm_id}`);

      //   logger.success(`알람 취소: ${alarm.alarm_id}`);
    } catch (error) {
      //   logger.error("알람 취소 실패:", error);
      throw error;
    }
  }

  /**
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
