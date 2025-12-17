// backend/src/services/notification/handlers/reminder-alarm.handler.ts

import { ReminderAlarm } from "../../../models/ReminderAlarm.model";
import { AlarmHandler } from "./alarm-handler.interface";
import {
  AlarmData,
  AlarmJobData,
  AlarmType,
} from "../../../types/notification";
import { TimeCalculator } from "../../../utils/notification/timeCalculator";

export class ReminderAlarmHandler implements AlarmHandler<ReminderAlarm> {
  readonly alarmType = "reminderAlarm";

  canTrigger(alarm: ReminderAlarm): boolean {
    if (!alarm || !alarm.is_active) {
      return false;
    }
    return !!(alarm.date && alarm.time);
  }

  shouldReschedule(alarm: ReminderAlarm): boolean {
    // ReminderAlarm은 항상 일회성이므로 재스케줄링 불필요함
    return false;
  }

  calculateNextTriggerTime(
    alarm: ReminderAlarm,
    currentTime: Date = new Date()
  ): Date | null {
    if (alarm.date && alarm.time) {
      const dateString =
        alarm.date instanceof Date
          ? alarm.date.toISOString().split("T")[0]
          : alarm.date;
      return TimeCalculator.calculateEventTriggerTime(alarm.time, dateString);
    }
    return null;
  }

  createJobData(alarm: ReminderAlarm): AlarmJobData {
    return {
      // TODO : alarmType 타입 정리...
      //   alarmType: this.alarmType,
      alarmType: "reminderAlarm" as AlarmType,
      alarmId: alarm.reminder_alarm_id,
      userId: alarm.user_id,
      triggerTime: this.calculateNextTriggerTime(alarm) || new Date(),
    };
  }

  buildAlarmData(alarm: ReminderAlarm): AlarmData {
    return {
      alarmId: alarm.reminder_alarm_id,
      userId: alarm.user_id,
      title: alarm.title || "리마인더 알람",
      message: alarm.title || "리마인더 알람 시간입니다.",
      reminderId: alarm.reminder_id,
      timestamp: new Date().toISOString(),
      alarmKind: "once", // 리마인더 알람은 항상 일회성 알람
    };
  }

  async completeAlarm(alarm: ReminderAlarm): Promise<void> {
    await alarm.update({ is_active: false });
  }

  // TODO : 리마인더 알람은 once라 필요하지 않음
  async updateNextTriggerTime(
    alarm: ReminderAlarm,
    // TODO : ?
    nextTime: Date | null
  ): Promise<void> {
    alarm.next_trigger_at = new Date();
    await alarm.save();
  }

  async rescheduleAlarm(
    alarm: ReminderAlarm,
    currentTime: Date = new Date()
  ): Promise<Date | null> {
    // 일회성이므로 재스케줄링 없이 완료 처리
    await alarm.update({
      last_triggered_at: currentTime,
      trigger_count: (alarm.trigger_count || 0) + 1,
      is_active: false,
    });
    return null;
  }

  async findById(alarmId: number): Promise<ReminderAlarm | null> {
    return await ReminderAlarm.findByPk(alarmId);
  }

  getAlarmId(alarm: ReminderAlarm): number {
    return alarm.reminder_alarm_id!;
  }

  getUserId(alarm: ReminderAlarm): number {
    return alarm.user_id;
  }
}
