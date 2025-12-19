// services/notification/sse-subscription.manager.ts
import { redisSubscriber } from "../../config/redis";
import { DebouncedActionManager } from "../../utils/notification/debouncedActionManager";

export type MessageListener = (channel: string, message: string) => void;

class RedisSubscriptionManager {
  private channelListeners = new Map<string, Set<MessageListener>>();

  private subscriptionState = new Map<
    string,
    {
      isSubscribed: boolean;
      refCount: number; // 리스너 수는 이걸로 관리
    }
  >();

  private unsubscribeDebouncer = new DebouncedActionManager<string>(200);

  constructor() {
    // Manager가 Redis 메시지를 받아서 라우팅
    redisSubscriber.on("message", this.handleRedisMessage.bind(this));
  }

  /**
   * Redis로부터 메시지를 받아서 해당 채널의 리스너들에게 전달
   */
  private handleRedisMessage(channel: string, message: string) {
    const listeners = this.channelListeners.get(channel);

    if (!listeners || listeners.size === 0) {
      console.warn(`[Manager] 📭 리스너 없는 채널에 메시지 도착: ${channel}`);
      return;
    }

    console.log(
      `[Manager] 📬 메시지 전달: ${channel} → ${listeners.size}개 리스너`
    );

    // 모든 리스너에게 메시지 전달
    for (const listener of listeners) {
      try {
        listener(channel, message);
      } catch (error) {
        console.error(`[Manager] ❌ 리스너 실행 에러:`, error);
      }
    }
  }

  /**
   * 구독 및 리스너 추가
   */
  async subscribe(channel: string, listener: MessageListener): Promise<void> {
    // 예약된 구독 해제가 있으면 삭제함
    if (this.unsubscribeDebouncer.isPending(channel)) {
      this.unsubscribeDebouncer.cancel(channel);
      console.log(`[Manager] 🚫 Unsubscribe 취소: ${channel}`);
    }

    // 리스너 추가
    if (!this.channelListeners.has(channel)) {
      this.channelListeners.set(channel, new Set());
    }
    this.channelListeners.get(channel)!.add(listener);

    if (!this.subscriptionState.has(channel)) {
      this.subscriptionState.set(channel, {
        isSubscribed: false,
        refCount: 0,
      });
    }

    const state = this.subscriptionState.get(channel)!;
    state.refCount++;

    // Redis 구독 -> 구독상태가 아닐 경우
    if (!state.isSubscribed) {
      try {
        await redisSubscriber.subscribe(channel);
        state.isSubscribed = true;
        console.log(
          `[Manager] ✅ Redis 구독 시작: ${channel} (RefCount: ${state.refCount})`
        );
      } catch (error) {
        // 실패 시 롤백
        state.refCount--;
        this.channelListeners.get(channel)!.delete(listener);
        console.error(`[Manager] ❌ Redis 구독 실패: ${channel}`, error);
        throw error;
      }
    } else {
      console.log(
        `[Manager] ℹ️  기존 구독 재사용: ${channel} (RefCount: ${state.refCount})`
      );
    }
  }

  /**
   * 구독 해제 및 리스너 제거 (디바운스 적용됨)
   */
  async unsubscribe(channel: string, listener: MessageListener): Promise<void> {
    const listeners = this.channelListeners.get(channel);
    if (!listeners) {
      console.warn(`[Manager] ⚠️  알 수 없는 채널: ${channel}`);
      return;
    }

    // 리스너 제거
    listeners.delete(listener);

    const state = this.subscriptionState.get(channel);
    if (!state) return;

    state.refCount = Math.max(0, state.refCount - 1);

    // 마지막 리스너가 제거되면 디바운스된 unsubscribe 예약
    if (state.refCount === 0 && listeners.size === 0) {
      this.unsubscribeDebouncer.schedule(channel, async () => {
        const currentState = this.subscriptionState.get(channel);
        const currentListeners = this.channelListeners.get(channel);

        if (
          currentState &&
          currentState.refCount === 0 &&
          (!currentListeners || currentListeners.size === 0)
        ) {
          try {
            await redisSubscriber.unsubscribe(channel);
            currentState.isSubscribed = false;

            this.channelListeners.delete(channel);
            this.subscriptionState.delete(channel);

            console.log(`[Manager] ✅ Redis 구독 해제: ${channel}`);
          } catch (error) {
            console.error(`[Manager] ❌ Redis 구독 해제 실패:`, error);
          }
        } else {
          console.log(`[Manager] ℹ️  구독 유지 (새 리스너 감지): ${channel}`);
        }
      });

      console.log(`[Manager] ⏰ Unsubscribe 예약: ${channel} (200ms 후)`);
    } else {
      console.log(`[Manager] 📊 ${channel} RefCount: ${state.refCount}`);
    }
  }

  /**
   * 디버깅용
   */
  getChannelStatus(channel: string) {
    return {
      listeners: this.channelListeners.get(channel)?.size || 0,
      state: this.subscriptionState.get(channel),
      pendingUnsubscribe: this.unsubscribeDebouncer.isPending(channel),
    };
  }

  /**
   * 디버깅용
   */
  getAllChannels(): string[] {
    return Array.from(this.channelListeners.keys());
  }

  /**
   * Cleanup
   */
  async destroy(): Promise<void> {
    this.unsubscribeDebouncer.cancelAll();

    for (const [channel, state] of this.subscriptionState) {
      if (state.isSubscribed) {
        try {
          await redisSubscriber.unsubscribe(channel);
        } catch (error) {
          console.error(`[Manager] Cleanup 실패: ${channel}`, error);
        }
      }
    }

    this.channelListeners.clear();
    this.subscriptionState.clear();
  }
}

export const redisSubscriptionManager = new RedisSubscriptionManager();
