// queues/queue.config.ts
import { QueueOptions, WorkerOptions } from "bullmq";
import { redisClient } from "./redis";

export const queueConfig: QueueOptions = {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600, // 1시간 후 제거
      count: 100, // 최대 100개 유지
    },
    removeOnFail: {
      age: 86400, // 24시간 후 제거
      count: 500,
    },
  },
};

export const workerConfig: WorkerOptions = {
  connection: redisClient,
  concurrency: 10,
  limiter: {
    max: 100, // 최대 작업 수
    duration: 1000, // 시간 간격 (ms)
  },
};
