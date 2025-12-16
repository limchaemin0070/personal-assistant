import { Queue } from "bullmq";
import { AlarmJobData } from "../types/notification";
import { queueConfig } from "../config/queue";
import { QUEUE_CONSTANTS } from "../constants/redis-keys";

class AlarmQueue {
  private static instance: Queue<AlarmJobData>;

  static getInstance(): Queue<AlarmJobData> {
    if (!this.instance) {
      this.instance = new Queue<AlarmJobData>(
        QUEUE_CONSTANTS.ALARM_QUEUE_NAME,
        queueConfig
      );
    }
    return this.instance;
  }

  /**
   * 알람 스케줄 큐 등록
   */
  static async scheduleAlarm(
    alarmId: number,
    triggerTime: Date,
    jobData: AlarmJobData
  ): Promise<void> {
    const queue = this.getInstance();
    const delay = Math.max(0, triggerTime.getTime() - Date.now());

    await queue.add(QUEUE_CONSTANTS.JOB_TYPES.SEND_ALARM, jobData, {
      jobId: QUEUE_CONSTANTS.alarmJobId(alarmId),
      delay,
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  /**
   * 알람 스케줄 큐에서 취소
   * 알람 삭제되거나 비활성화되었을 떄
   */
  static async cancelAlarm(alarmId: number): Promise<void> {
    const queue = this.getInstance();
    const job = await queue.getJob(QUEUE_CONSTANTS.alarmJobId(alarmId));
    if (job) {
      await job.remove();
    }
  }

  /**
   * 알람 스케줄 큐에서 업데이트
   * 존재하는 알람 수정되었을 때
   */
  static async updateAlarmSchedule(
    alarmId: number,
    triggerTime: Date,
    jobData: AlarmJobData
  ): Promise<void> {
    await this.cancelAlarm(alarmId);
    await this.scheduleAlarm(alarmId, triggerTime, jobData);
  }
}

export default AlarmQueue;
