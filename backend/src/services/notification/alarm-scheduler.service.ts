import { Alarm } from "../../models";
import { QUEUE_CONSTANTS } from "../../constants/redis-keys";
import AlarmQueue from "../../queue/alarm.queue";
import { AlarmJobData } from "../../types/notification";

/**
 * BullMQ 기반 알람 스케줄 관리 전용 서비스
 * 책임: 알람 스케줄의 등록/취소/업데이트만 담당
 */
class AlarmSchedulerService {
  /**
   * 알람 스케줄 등록
   */
  async scheduleAlarmAt(alarmId: number, triggerTime: Date): Promise<void> {
    const alarm = await Alarm.findByPk(alarmId);
    if (!alarm) {
      throw new Error(`Alarm ${alarmId} not found`);
    }

    const jobData: AlarmJobData = {
      type: QUEUE_CONSTANTS.JOB_TYPES.SEND_ALARM,
      data: {
        alarmId,
        userId: alarm.user_id,
      },
    };

    await AlarmQueue.scheduleAlarm(alarmId, triggerTime, jobData);
  }

  /**
   * 알람 스케줄 업데이트
   */
  async updateAlarmSchedule(alarmId: number, triggerTime: Date): Promise<void> {
    const alarm = await Alarm.findByPk(alarmId);
    if (!alarm) {
      throw new Error(`Alarm ${alarmId} not found`);
    }

    const jobData: AlarmJobData = {
      type: QUEUE_CONSTANTS.JOB_TYPES.SEND_ALARM,
      data: {
        alarmId,
        userId: alarm.user_id,
      },
    };

    await AlarmQueue.updateAlarmSchedule(alarmId, triggerTime, jobData);
  }

  /**
   * 알람 취소 (스케줄에서 제거)
   */
  async cancelAlarm(alarmId: number): Promise<void> {
    await AlarmQueue.cancelAlarm(alarmId);
  }
}

export const alarmSchedulerService = new AlarmSchedulerService();
