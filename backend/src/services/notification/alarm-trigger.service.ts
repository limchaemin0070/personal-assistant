import { Alarm } from "../../models";
import { TimeCalculator } from "../../utils/notification/timeCalculator";
import notificationService from "./notification.service";
import { alarmSchedulerService } from "./alarm-scheduler.service";
import { normalizeRepeatDays } from "../../utils/alarm/alarmUtils";

/**
 * 알람 실행 로직 전용 서비스
 * 알람 트리거 실행, 알림 발송, 다음 시간 계산, DB 업데이트
 */
class AlarmTriggerService {
  /**
   * 알람이 트리거 가능한지 검증
   */
  canTrigger(alarm: Alarm): boolean {
    if (!alarm || !alarm.is_active) {
      return false;
    }

    const repeatDays = normalizeRepeatDays(alarm.repeat_days);
    if (!alarm.is_repeat || repeatDays.length === 0) {
      return false;
    }

    return true;
  }

  /**
   * 알람 트리거 실행 (알림 발송)
   */
  async triggerAlarm(alarm: Alarm): Promise<void> {
    await notificationService.sendNotification(alarm);
  }

  /**
   * 재스케줄링 필요 여부 판단
   */
  shouldReschedule(alarm: Alarm): boolean {
    return alarm.is_repeat && alarm.is_active;
  }

  /**
   * 다음 실행 시간 계산
   */
  calculateNextTriggerTime(
    alarm: Alarm,
    currentTime: Date = new Date()
  ): Date | null {
    const repeatDays = normalizeRepeatDays(alarm.repeat_days);

    if (!repeatDays || repeatDays.length === 0) {
      return null;
    }

    return TimeCalculator.calculateNextTriggerTime(
      alarm.time,
      repeatDays,
      currentTime
    );
  }

  /**
   * 알람 재스케줄링 및 DB 업데이트
   */
  async rescheduleAlarm(
    alarm: Alarm,
    currentTime: Date = new Date()
  ): Promise<Date | null> {
    const nextTriggerTime = this.calculateNextTriggerTime(alarm, currentTime);

    if (!nextTriggerTime) {
      // 더 이상 반복 없음
      await alarm.update({ is_active: false });
      return null;
    }

    // DB 업데이트
    await alarm.update({
      last_triggered_at: currentTime,
      next_trigger_at: nextTriggerTime,
      trigger_count: (alarm.trigger_count || 0) + 1,
    });

    return nextTriggerTime;
  }

  /**
   * 알람 완료 처리 (더 이상 반복 없음)
   */
  async completeAlarm(alarm: Alarm): Promise<void> {
    await alarm.update({ is_active: false });
  }

  /**
   * 알람 실행 시점 (트리거 + 재스케줄링)
   * 알람 실행 프로세스 전체 처리
   */
  async processAlarm(alarmId: number, currentTime: Date): Promise<void> {
    // DB에서 알람 조회
    const alarm = await Alarm.findByPk(alarmId);

    if (!alarm) {
      // 알람이 없으면 스케줄에서 제거
      await alarmSchedulerService.cancelAlarm(alarmId);
      return;
    }

    // 트리거 가능 여부 검증
    if (!this.canTrigger(alarm)) {
      // 트리거 불가능하면 스케줄에서 제거
      await alarmSchedulerService.cancelAlarm(alarmId);
      return;
    }

    // 알람 트리거 실행 (알림 발송)
    await this.triggerAlarm(alarm);

    // 재스케줄링
    if (this.shouldReschedule(alarm)) {
      const nextTriggerTime = await this.rescheduleAlarm(alarm, currentTime);

      if (nextTriggerTime) {
        // 다음 실행 시간이 있으면 스케줄에 등록
        await alarmSchedulerService.scheduleAlarmAt(alarmId, nextTriggerTime);
      } else {
        // 더 이상 반복 없으면 완료 처리 및 스케줄에서 제거
        await alarmSchedulerService.cancelAlarm(alarmId);
      }
    } else {
      // 재스케줄링 불필요하면 스케줄에서 제거
      await alarmSchedulerService.cancelAlarm(alarmId);
    }
  }
}

export const alarmTriggerService = new AlarmTriggerService();
