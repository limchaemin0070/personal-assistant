// Redis 구현체
import { redisPublisher } from "../../../config/redis";
import { AlarmTransportPayload } from "../../../types/notification";
import { REDIS_KEYS } from "../../../constants/redis-keys";
import { AlarmSender } from "./alarm-sender.interface";

/**
 * Redis Pub/Sub 알람 전송 구현체
 * SSE 연결된 클라이언트에게 실시간 알림 전달
 */
export class RedisPubSubAlarmSender implements AlarmSender {
  readonly name = "RedisPubSub";

  async send(payload: AlarmTransportPayload): Promise<void> {
    const channel = REDIS_KEYS.alarmTriggerChannel(payload.data.userId);

    await redisPublisher.publish(channel, JSON.stringify(payload));
  }
}
