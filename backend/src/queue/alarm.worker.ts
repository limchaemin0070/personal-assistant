import { Worker, Job } from "bullmq";
import { AlarmJobData } from "../types/notification";
import { workerConfig } from "../config/queue";
import { QUEUE_CONSTANTS } from "../constants/redis-keys";
import { alarmProcessorService } from "../services/notification/alarm-processor.service";

const alarmWorker = new Worker<AlarmJobData>(
  QUEUE_CONSTANTS.ALARM_QUEUE_NAME,
  async (job: Job<AlarmJobData>) => {
    // BullMQ의 Job.name 속성에 job type이 저장됨
    const jobType = job.name;

    switch (jobType) {
      case QUEUE_CONSTANTS.JOB_TYPES.SEND_ALARM:
        await alarmProcessorService.processAlarmJob(job);
        break;

      case QUEUE_CONSTANTS.JOB_TYPES.CHECK_SCHEDULED_ALARMS:
        console.log("CHECK_SCHEDULED_ALARMS job received (no-op)");
        break;

      default:
        throw new Error(`Unknown job type: ${jobType}`);
    }
  },
  workerConfig
);

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
