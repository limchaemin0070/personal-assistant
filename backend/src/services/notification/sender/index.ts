import { AlarmSender } from "./alarm-sender.interface";
import { RedisPubSubAlarmSender } from "./redis-pubsub-alarm-sender";

export type { AlarmSender } from "./alarm-sender.interface";
export { RedisPubSubAlarmSender } from "./redis-pubsub-alarm-sender";

export function createAlarmSenders(): AlarmSender[] {
  const senders: AlarmSender[] = [];

  // Redis Pub/Sub는 항상 활성화함
  senders.push(new RedisPubSubAlarmSender());

  // 추후 필요하면 sender 추가

  return senders;
}
