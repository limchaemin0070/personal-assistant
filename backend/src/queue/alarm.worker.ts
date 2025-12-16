import { Worker, Job } from "bullmq";
import { AlarmJobData } from "../types/notification";
import { workerConfig } from "../config/queue";
import { Alarm } from "../models";
import { alarmTriggerService } from "../services/notification/alarm-trigger.service";
import { QUEUE_CONSTANTS } from "../constants/redis-keys";

const alarmWorker = new Worker<AlarmJobData>(
  QUEUE_CONSTANTS.ALARM_QUEUE_NAME,
  async (job: Job<AlarmJobData>) => {
    const { type, data } = job.data;

    switch (type) {
      case QUEUE_CONSTANTS.JOB_TYPES.SEND_ALARM:
        if (!data?.alarmId) {
          throw new Error("alarmId is required for SEND_ALARM");
        }
        await handleSendAlarm(data.alarmId);
        break;

      case QUEUE_CONSTANTS.JOB_TYPES.CHECK_SCHEDULED_ALARMS:
        await handleScheduledAlarms();
        break;

      //   case "CLEANUP_OLD_ALARMS":
      //     await handleCleanup();
      //     break;

      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  },
  workerConfig
);

async function handleSendAlarm(alarmId: number): Promise<void> {
  const currentTime = new Date();
  await alarmTriggerService.processAlarm(alarmId, currentTime);
}

async function handleScheduledAlarms(): Promise<void> {
  // 필요시 유지 (예: DB에서 스케줄 동기화)
  // 대부분의 경우 BullMQ가 자동으로 처리하므로 불필요할 수 있음
}

// 워커 이벤트 리스너
alarmWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

alarmWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

alarmWorker.on("error", (err) => {
  console.error("❌ Worker error:", err);
});

export default alarmWorker;
