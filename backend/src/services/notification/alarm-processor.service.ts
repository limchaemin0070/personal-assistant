// backend/src/services/notification/alarm-processor.service.ts

import { Job } from "bullmq";
import { AlarmJobData } from "../../types/notification";
import notificationService from "./notification.service";
import { alarmSchedulerService } from "./alarm-scheduler.service";
import { AlarmHandlerFactory } from "./handler/alarm-handler.factory";

/**
 * BullMQ Job 처리 서비스
 * 책임: Job이 실행될 때의 비즈니스 로직 처리
 */
class AlarmProcessorService {
  /**
   * BullMQ Worker에서 호출되는 Job 처리 함수
   */
  async processAlarmJob(job: Job<AlarmJobData>): Promise<void> {
    const { alarmType, alarmId, triggerTime, userId, message } = job.data;

    if (!alarmId) {
      console.warn(`Alarm ${alarmId} not found, job will be removed`);
      return;
    }

    if (!alarmType) {
      console.warn(`Alarm ${alarmType} not found, job will be removed`);
      return;
    }

    console.log(
      `Processing alarm: ${alarmId} (${alarmType}) for user ${userId}`
    );

    try {
      const result = await AlarmHandlerFactory.getHandlerAndLoadAlarm(
        alarmId,
        alarmType
      );

      if (!result) {
        console.warn(`Alarm ${alarmId} not found, job will be removed`);
        return;
      }

      const { handler, alarm } = result;

      // 1. 트리거 가능 여부 검증
      if (!handler.canTrigger(alarm)) {
        console.log(`Alarm ${alarmId} cannot be triggered, skipping job`);
        return;
      }

      // 2. 알림 발송
      const alarmData = handler.buildAlarmData(alarm);
      await notificationService.sendNotification(alarmData);

      // 3. 생명주기 관리
      if (handler.shouldReschedule(alarm)) {
        // 반복 알람: 다음 시간 계산 및 업데이트
        const nextTime = handler.calculateNextTriggerTime(alarm);
        await handler.updateNextTriggerTime(alarm, nextTime);

        console.log(`Alarm ${alarmId} will repeat at ${nextTime}`);
      } else {
        // 일회성 알람: 완료 처리
        await handler.completeAlarm(alarm);

        console.log(`Alarm ${alarmId} completed`);
      }
    } catch (error) {
      console.error(`Failed to process alarm ${alarmId}:`, error);
      throw error; // BullMQ 재시도를 위해 throw
    }
  }
}

export const alarmProcessorService = new AlarmProcessorService();
