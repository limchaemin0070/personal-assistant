import { redisSubscriber } from "../../config/redis";

class SSESubscriptionManager {
  private counts = new Map<string, number>();

  async subscribe(channel: string) {
    const count = this.counts.get(channel) || 0;
    if (count === 0) {
      // 구독이 0일때만 구독 시작
      await redisSubscriber.subscribe(channel);
      console.log(`[Manager] Redis 실제 구독 시작: ${channel}`);
    }
    this.counts.set(channel, count + 1);
  }

  async unsubscribe(channel: string) {
    const count = (this.counts.get(channel) || 1) - 1;
    if (count <= 0) {
      // 마지막 한 명이 나갈 때만 구독 해제
      await redisSubscriber.unsubscribe(channel);
      this.counts.delete(channel);
      console.log(`[Manager] Redis 실제 구독 해제: ${channel}`);
    } else {
      this.counts.set(channel, count);
    }
  }
}

export const sseSubscriptionManager = new SSESubscriptionManager();
