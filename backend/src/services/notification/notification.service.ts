import { redisClient, redisPublisher } from "../../config/redis";
import { Alarm } from "../../models";
import {
  AlarmData,
  AlarmKind,
  AlarmTransportPayload,
} from "../../types/notification";
import { REDIS_KEYS } from "../../constants/redis-keys";
import { AlarmSender } from "./sender";

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
  async sendNotification(alarm: Alarm): Promise<void> {
    const alarmData = this.buildAlarmData(alarm);
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
   * 알람 데이터 빌드
   * 도메인 모델(Alarm)을 AlarmData DTO로 변환
   * @returns AlarmData - buildAlarmData는 항상 AlarmData를 반환
   */
  private buildAlarmData(alarm: Alarm): AlarmData {
    return {
      alarmId: alarm.alarm_id,
      userId: alarm.user_id,
      title: alarm.title || "알람",
      message: alarm.title || "알람 시간입니다.",
      scheduleId: alarm.schedule_id ?? null,
      reminderId: alarm.reminder_id ?? null,
      timestamp: new Date().toISOString(),
      alarmKind: alarm.alarm_type as AlarmKind,
    };
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
      alarmKind: "basic",
    };

    const payload: AlarmTransportPayload = {
      type: "ALARM_TRIGGER",
      data: testData,
    };

    await Promise.all(this.senders.map((s) => s.send(payload)));
  }
}

import { createAlarmSenders } from "./sender";
export default new NotificationService(createAlarmSenders());
