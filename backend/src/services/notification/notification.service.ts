import { redisClient, redisPublisher } from "../../config/redis";
import { Alarm } from "../../models";

interface AlarmData {
  alarmId: number;
  userId: number;
  title: string;
  message: string;
  // 스케줄/리마인더와 무관한 독립 알람을 위해 null/undefined 허용
  scheduleId?: number | null;
  reminderId?: number | null;
  timestamp: string;
  alarmType: string;
}

/**
 * 알람 발송 서비스
 * 다양한 채널을 통한 알람 전송 관리
 * 현재는 브라우저에 기본 팝업 + 소리 알람만 제공함
 */
class NotificationService {
  /**
   * 알람 트리거 (메인 진입점)
   */
  async triggerAlarm(alarm: Alarm): Promise<void> {
    // logger.info(`🔔 알람 트리거: ${alarm.alarm_id} - ${alarm.title}`);

    const alarmData = this.buildAlarmData(alarm);

    try {
      // 다양한 채널로 발송
      await Promise.all([this.sendPubSub(alarmData)]);

      // 히스토리 저장
      await this.saveHistory(alarmData);

      //   logger.success(`알람 트리거 완료: ${alarm.alarm_id}`);
    } catch (error) {
      //   logger.error(`알람 트리거 실패: ${alarm.alarm_id}`, error);
      throw error;
    }
  }

  /**
   * 알람 데이터 빌드
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
      alarmType: alarm.alarm_type,
    };
  }

  /**
   * Pub/Sub 발송
   */
  private async sendPubSub(data: AlarmData): Promise<void> {
    await redisPublisher.publish(
      `alarm:trigger:user:${data.userId}`,
      JSON.stringify({
        type: "ALARM_TRIGGER",
        data,
      })
    );
  }

  /**
   * TODO : 푸시알림 발송 로직 구현 [제외]
   */
  //   private async sendPush(data: AlarmData): Promise<void> {
  //     // FCM, APNS 등
  //     // logger.info("Push 알림 발송 (미구현)");
  //   }

  /**
   * 히스토리 저장
   */
  private async saveHistory(data: AlarmData): Promise<void> {
    await redisClient.lpush(
      `alarm:history:${data.userId}`,
      JSON.stringify({
        ...data,
        triggeredAt: new Date().toISOString(),
      })
    );

    // 최근 100개만 유지
    await redisClient.ltrim(`alarm:history:${data.userId}`, 0, 99);
  }

  /**
   * 테스트 알람 발송
   */
  async sendTestAlarm(userId: number, title: string): Promise<void> {
    const testData: AlarmData = {
      alarmId: 0,
      userId,
      title,
      message: "테스트 알람입니다",
      timestamp: new Date().toISOString(),
      alarmType: "test",
    };

    await this.sendPubSub(testData);
  }
}

export default new NotificationService();
