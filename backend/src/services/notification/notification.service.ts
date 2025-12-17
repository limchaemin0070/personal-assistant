import { redisClient } from "../../config/redis";
import { REDIS_KEYS } from "../../constants/redis-keys";
import {
  AlarmData,
  AlarmKind,
  AlarmTransportPayload,
} from "../../types/notification";
import { AlarmSender } from "./sender";
import { createAlarmSenders } from "./sender";

/**
 * 알림 발송 서비스
 */
class NotificationService {
  constructor(private senders: AlarmSender[]) {
    if (senders.length === 0) {
      throw new Error("최소 하나의 AlarmSender가 필요합니다.");
    }
  }

  /**
   * 알림 발송
   */
  async sendNotification(alarmData: AlarmData): Promise<void> {
    const payload: AlarmTransportPayload = {
      type: "ALARM_TRIGGER",
      data: alarmData,
    };

    try {
      await Promise.all(
        this.senders.map((sender) =>
          sender.send(payload).catch((error) => {
            console.error(`[${sender.name}] 전송 실패:`, error);
            throw error;
          })
        )
      );

      await this.saveHistory(alarmData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Redis에 히스토리 저장
   */
  private async saveHistory(alarmData: AlarmData): Promise<void> {
    const historyKey = REDIS_KEYS.alarmHistory(alarmData.userId);
    await redisClient.lpush(
      historyKey,
      JSON.stringify({
        ...alarmData,
        triggeredAt: new Date().toISOString(),
      })
    );

    // 최근 100개만 유지
    await redisClient.ltrim(historyKey, 0, 99);
  }

  /**
   * 테스트 알림 발송
   */
  async sendTestNotification(userId: number, title: string): Promise<void> {
    const testData: AlarmData = {
      alarmId: 0,
      userId,
      title,
      message: "테스트 알림입니다",
      timestamp: new Date().toISOString(),
      alarmKind: "repeat",
    };

    const payload: AlarmTransportPayload = {
      type: "ALARM_TRIGGER",
      data: testData,
    };

    await Promise.all(this.senders.map((s) => s.send(payload)));
  }
}

export default new NotificationService(createAlarmSenders());
