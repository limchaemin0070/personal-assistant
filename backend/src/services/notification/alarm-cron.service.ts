import * as cron from "node-cron";
import { alarmSchedulerService } from "./alarm-scheduler.service";
import { alarmTriggerService } from "./alarm-trigger.service";

/**
 * Cron 작업 Orchestration 전용 서비스
 * 책임: Cron 스케줄 관리 및 알람 체크 작업 조율
 */
class AlarmCronService {
  private isInitialized = false;
  private cronJob: cron.ScheduledTask | null = null;

  /**
   * 초기화 및 Cron 작업 시작
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.startScheduler();
      this.isInitialized = true;
      console.log("═══════════════════════════════════════");
      console.log(`✅ 알람 Cron 서비스 초기화 완료`);
      console.log("═══════════════════════════════════════\n");
    } catch (error) {
      console.error("❌ 알람 Cron 서비스 초기화 실패:", error);
      throw error;
    }
  }

  /**
   * Cron 작업 시작 (매분 실행)
   */
  private startScheduler(): void {
    this.cronJob = cron.schedule("* * * * *", async () => {
      await this.checkAndTriggerAlarms();
    });
  }

  /**
   * Cron 작업 중지
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      this.isInitialized = false;
      console.log("알람 Cron 작업이 중지되었습니다.");
    }
  }

  /**
   * 알람 체크 및 트리거 (매분 실행)
   */
  private async checkAndTriggerAlarms(): Promise<void> {
    try {
      const now = Date.now();

      // 현재 시간까지의 모든 알람 ID 조회
      const alarmIds = await alarmSchedulerService.getDueAlarmIds(now);

      if (alarmIds.length === 0) {
        return;
      }

      // 각 알람을 트리거 서비스로 전달
      for (const alarmId of alarmIds) {
        try {
          await alarmTriggerService.processAlarm(alarmId, new Date(now));
        } catch (error) {
          console.error(`[Cron] 알람 ${alarmId} 처리 실패:`, error);
        }
      }
    } catch (error) {
      console.error("[Cron] 알람 체크 실패:", error);
    }
  }
}

export const alarmCronService = new AlarmCronService();
