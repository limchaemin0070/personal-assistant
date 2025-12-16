import { AlarmSender } from "./alarm-sender.interface";
import { RedisPubSubAlarmSender } from "./redis-pubsub-alarm-sender";

export type { AlarmSender } from "./alarm-sender.interface";
export { RedisPubSubAlarmSender } from "./redis-pubsub-alarm-sender";

export function createAlarmSenders(): AlarmSender[] {
  const senders: AlarmSender[] = [];

  // Redis Pub/Sub는 항상 활성화함
  senders.push(new RedisPubSubAlarmSender());

  // 모바일 푸시 알림을 구현하게 되면 설정이나 환경변수를 통해 sender 추가
  // if (process.env.ENABLE_PUSH_NOTIFICATION === "true") {
  //   senders.push(new PushAlarmSender());
  // }

  return senders;
}
