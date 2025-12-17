import { Queue } from "bullmq";
import { AlarmJobData, AlarmType } from "../types/notification";
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
  static async scheduleAlarm(jobData: AlarmJobData): Promise<void> {
    const queue = this.getInstance();

    if (!jobData.alarmType || !jobData.alarmId || !jobData.triggerTime) {
      throw new Error(
        "alarmType, alarmId, and triggerTime are required in jobData"
      );
    }

    const delay = Math.max(0, jobData.triggerTime.getTime() - Date.now());

    await queue.add(QUEUE_CONSTANTS.JOB_TYPES.SEND_ALARM, jobData, {
      jobId: QUEUE_CONSTANTS.alarmJobId(jobData.alarmType, jobData.alarmId),
      delay,
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  /**
   * 알람 스케줄 큐에서 업데이트 (id로)
   * 존재하는 알람 수정되었을 때
   */
  static async updateAlarmSchedule(
    alarmId: number,
    alarmType: AlarmType,
    jobData: AlarmJobData
  ): Promise<void> {
    await this.cancelAlarm(alarmId, alarmType);
    await this.scheduleAlarm(jobData);
  }

  /**
   * 알람 스케줄 큐에서 취소 (id로)
   * 알람 삭제되거나 비활성화되었을 때
   */
  static async cancelAlarm(
    alarmId: number,
    alarmType: AlarmType
  ): Promise<void> {
    const queue = this.getInstance();
    const job = await queue.getJob(
      QUEUE_CONSTANTS.alarmJobId(alarmType, alarmId)
    );
    if (job) {
      await job.remove();
    }
  }
}

export default AlarmQueue;
