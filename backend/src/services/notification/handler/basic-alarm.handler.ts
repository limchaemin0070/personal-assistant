// backend/src/services/notification/handlers/basic-alarm.handler.ts

import { Alarm } from "../../../models/Alarm.model";
import { AlarmHandler } from "./alarm-handler.interface";
import {
  AlarmData,
  AlarmJobData,
  AlarmKind,
  AlarmType,
} from "../../../types/notification";
import { TimeCalculator } from "../../../utils/notification/timeCalculator";
import { normalizeRepeatDays } from "../../../utils/alarm/alarmUtils";

/**
 * 그냥 일반 알람 핸들링
 *
 */
export class BasicAlarmHandler implements AlarmHandler<Alarm> {
  readonly alarmType = "alarm";

  canTrigger(alarm: Alarm): boolean {
    if (!alarm || !alarm.is_active) {
      return false;
    }

    // 반복 알람인 경우
    if (alarm.is_repeat) {
      const repeatDays = normalizeRepeatDays(alarm.repeat_days);
      return repeatDays.length > 0;
    }

    // 일회성 알람인 경우 (alarm_type이 "once"인 경우만)
    return !!(alarm.date && alarm.time && alarm.alarm_type === "once");
  }

  shouldReschedule(alarm: Alarm): boolean {
    return alarm.is_repeat && alarm.is_active;
  }

  calculateNextTriggerTime(
    alarm: Alarm,
    currentTime: Date = new Date()
  ): Date | null {
    // 반복 알람인 경우
    if (alarm.is_repeat) {
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

    // 일회성 알람인 경우
    if (alarm.date && alarm.time && alarm.alarm_type === "once") {
      const dateString =
        alarm.date instanceof Date
          ? alarm.date.toISOString().split("T")[0]
          : alarm.date;
      return TimeCalculator.calculateEventTriggerTime(alarm.time, dateString);
    }

    return null;
  }

  createJobData(alarm: Alarm): AlarmJobData {
    return {
      // TODO : alarmType 타입 정리...
      //   alarmType: this.alarmType,
      alarmType: "alarm" as AlarmType,
      alarmId: alarm.alarm_id,
      userId: alarm.user_id,
      triggerTime: this.calculateNextTriggerTime(alarm) || new Date(),
    };
  }

  //   createJobOptions(alarm: Alarm): AlarmJobOptions {
  //     const nextTriggerTime = this.calculateNextTriggerTime(alarm);

  //     if (!nextTriggerTime) {
  //       // 일회성
  //       return {
  //         jobId: `alarm-${alarm.id}-${Date.now()}`,
  //         delay: 0,
  //       };
  //     }

  //     // 반복 - Cron 패턴
  //     const [hours, minutes] = alarm.time.split(":").map(Number);
  //     const cronDays = (alarm.repeat_days || []).join(",");
  //     const cronPattern = `${minutes} ${hours} * * ${cronDays}`;

  //     return {
  //       jobId: `alarm-${alarm.id}`,
  //       repeat: {
  //         pattern: cronPattern,
  //       },
  //     };
  //   }

  buildAlarmData(alarm: Alarm): AlarmData {
    return {
      alarmId: alarm.alarm_id,
      userId: alarm.user_id,
      title: alarm.title || "알람",
      message: alarm.title || "알람 시간입니다.",
      reminderId: null,
      timestamp: new Date().toISOString(),
      alarmKind: alarm.alarm_type as AlarmKind,
    };
  }

  async completeAlarm(alarm: Alarm): Promise<void> {
    await alarm.update({ is_active: false });
  }

  async updateNextTriggerTime(
    alarm: Alarm,
    // TODO : ?
    nextTime: Date | null
  ): Promise<void> {
    alarm.next_trigger_at = new Date();
    await alarm.save();
  }

  async rescheduleAlarm(
    alarm: Alarm,
    currentTime: Date = new Date()
  ): Promise<Date | null> {
    const nextTriggerTime = this.calculateNextTriggerTime(alarm, currentTime);

    if (!nextTriggerTime) {
      await alarm.update({ is_active: false });
      return null;
    }

    await alarm.update({
      last_triggered_at: currentTime,
      next_trigger_at: nextTriggerTime,
      trigger_count: (alarm.trigger_count || 0) + 1,
    });

    return nextTriggerTime;
  }

  async findById(alarmId: number): Promise<Alarm | null> {
    return await Alarm.findByPk(alarmId);
  }

  getAlarmId(alarm: Alarm): number {
    return alarm.alarm_id!;
  }

  getUserId(alarm: Alarm): number {
    return alarm.user_id;
  }
}
