import { Alarm } from "../../models";
import { ReminderAlarm } from "../../models/ReminderAlarm.model";
import { QUEUE_CONSTANTS } from "../../constants/redis-keys";
import AlarmQueue from "../../queue/alarm.queue";
import { AlarmJobData, AlarmType } from "../../types/notification";
import { AlarmHandlerFactory } from "./handler/alarm-handler.factory";

/**
 * BullMQ 기반 알람 스케줄 관리 전용 서비스
 * 알람 스케줄의 큐 관련 등록/취소/업데이트만 담당
 */
class AlarmSchedulerService {
  /**
   * 알람 스케줄 등록
   */
  async scheduleAlarm(alarm: Alarm | ReminderAlarm): Promise<void> {
    const handler = AlarmHandlerFactory.getHandlerByAlarm(alarm);

    if (!handler.canTrigger(alarm)) {
      console.log(`Alarm ${handler.getAlarmId(alarm)} is not active, skipping`);
      return;
    }

    const jobData = handler.createJobData(alarm);
    // const jobOptions = handler.createJobOptions(alarm);

    await AlarmQueue.scheduleAlarm(jobData);
  }

  /**
   * 알람 스케줄 업데이트
   */
  async updateAlarmSchedule(alarm: Alarm | ReminderAlarm): Promise<void> {
    const handler = AlarmHandlerFactory.getHandlerByAlarm(alarm);
    const alarmId = handler.getAlarmId(alarm);
    const alarmType = handler.alarmType as AlarmType;

    await this.cancelAlarm(alarmId, alarmType);
    await this.scheduleAlarm(alarm);
  }

  /**
   * 알람 취소 (스케줄에서 제거)
   */
  async cancelAlarm(
    alarmId: number,
    alarmType: AlarmType = AlarmType.ALARM
  ): Promise<void> {
    await AlarmQueue.cancelAlarm(alarmId, alarmType);
  }
}

export const alarmSchedulerService = new AlarmSchedulerService();
