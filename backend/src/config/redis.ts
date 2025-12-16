import Redis, { RedisOptions } from "ioredis";
import { env } from "./env";

/**
 * Redis 연결 관리 클래스
 * Redislabs 클라우드와 연결을 관리합니다
 */
class RedisManager {
  private static instance: RedisManager;
  private client: Redis | null = null;
  private subscriber: Redis | null = null;
  private publisher: Redis | null = null;

  private constructor() {}

  static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  /**
   * Redis 기본 옵션
   * TLS는 URL이 rediss://로 시작할 때만 활성화
   */
  private getBaseOptions(connectionName: string): RedisOptions {
    const baseOptions: RedisOptions = {
      connectionName,
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        console.log(`🔄 Redis 재연결 시도 ${times}번째 (${delay}ms 후)`);
        return delay;
      },
      reconnectOnError: (err: Error) => {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    };

    // TODO : 무료플랜에서는 TLS 미적용이므로 코드 제거
    if (env.REDIS_URL && env.REDIS_URL.startsWith("rediss://")) {
      baseOptions.tls = {
        rejectUnauthorized: false,
        requestCert: true,
      };
    }
    // redis:// (일반 포트)인 경우 TLS 없이 연결

    return baseOptions;
  }

  /**
   * Redis 클라이언트 초기화
   */
  private initializeClient(): Redis {
    if (!this.client) {
      const options = env.REDIS_URL
        ? this.getBaseOptions("main-client")
        : {
            host: "localhost",
            port: 6379,
            connectionName: "main-client",
          };

      this.client = env.REDIS_URL
        ? new Redis(env.REDIS_URL, options)
        : new Redis(options);

      this.setupEventHandlers(this.client, "Client");
    }
    return this.client;
  }

  /**
   * Redis Subscriber 클라이언트 초기화
   */
  private initializeSubscriber(): Redis {
    if (!this.subscriber) {
      const options = env.REDIS_URL
        ? this.getBaseOptions("subscriber")
        : {
            host: "localhost",
            port: 6379,
            connectionName: "subscriber",
          };

      this.subscriber = env.REDIS_URL
        ? new Redis(env.REDIS_URL, options)
        : new Redis(options);

      this.setupEventHandlers(this.subscriber, "Subscriber");
    }
    return this.subscriber;
  }

  /**
   * Redis Publisher 클라이언트 초기화
   */
  private initializePublisher(): Redis {
    if (!this.publisher) {
      const options = env.REDIS_URL
        ? this.getBaseOptions("publisher")
        : {
            host: "localhost",
            port: 6379,
            connectionName: "publisher",
          };

      this.publisher = env.REDIS_URL
        ? new Redis(env.REDIS_URL, options)
        : new Redis(options);

      this.setupEventHandlers(this.publisher, "Publisher");
    }
    return this.publisher;
  }

  /**
   * Redis 이벤트 핸들러 설정
   */
  private setupEventHandlers(client: Redis, name: string): void {
    client.on("connect", () => {
      console.log(`✅ Redis ${name} 연결됨`);
    });

    client.on("ready", () => {
      console.log(`✅ Redis ${name} 준비 완료`);
    });

    client.on("error", (error) => {
      console.error(`❌ Redis ${name} 오류:`, error.message);
    });

    client.on("close", () => {
      console.log(`⚠️ Redis ${name} 연결 종료됨`);
    });

    client.on("reconnecting", (delay: number) => {
      console.log(`🔄 Redis ${name} 재연결 시도 중... (${delay}ms 후)`);
    });

    client.on("end", () => {
      console.log(`🔌 Redis ${name} 연결 끊김`);
    });
  }

  /**
   * 일반 Redis 클라이언트 반환
   */
  getClient(): Redis {
    return this.initializeClient();
  }

  /**
   * 구독용 Redis 클라이언트 반환
   */
  getSubscriber(): Redis {
    return this.initializeSubscriber();
  }

  /**
   * 발행용 Redis 클라이언트 반환
   */
  getPublisher(): Redis {
    return this.initializePublisher();
  }

  /**
   * Redis 연결 테스트 (타임아웃 추가)
   */
  async testConnection(): Promise<boolean> {
    try {
      const client = this.getClient();

      // 타임아웃 설정 (10초)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Connection timeout")), 10000);
      });

      const pingPromise = client.ping();

      const result = await Promise.race([pingPromise, timeoutPromise]);

      if (result === "PONG") {
        console.log("✅ Redis 연결 테스트 성공");
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("❌ Redis 연결 테스트 실패:", error.message);
      return false;
    }
  }

  /**
   * Keyspace Notifications 활성화
   * 알람 만료 이벤트 감지를 위해 필요
   * TODO : 사용하지 않을 예정이므로 코드 제거 필요
   */
  async enableKeyspaceNotifications(): Promise<void> {
    try {
      const client = this.getClient();
      // Ex와 Kx 이벤트 활성화 (만료 이벤트 감지)
      await client.config("SET", "notify-keyspace-events", "Ex");
      console.log("✅ Keyspace Notifications 활성화 완료");
    } catch (error: any) {
      console.error("❌ Keyspace Notifications 활성화 실패:", error.message);
      throw error;
    }
  }

  /**
   * 모든 Redis 연결 종료
   */
  async disconnect(): Promise<void> {
    const disconnectPromises: Promise<void>[] = [];

    if (this.client) {
      disconnectPromises.push(
        this.client
          .quit()
          .then(() => {
            console.log("✅ Redis Client 연결 종료");
          })
          .catch(() => {
            this.client?.disconnect();
          })
      );
      this.client = null;
    }

    if (this.subscriber) {
      disconnectPromises.push(
        this.subscriber
          .quit()
          .then(() => {
            console.log("✅ Redis Subscriber 연결 종료");
          })
          .catch(() => {
            this.subscriber?.disconnect();
          })
      );
      this.subscriber = null;
    }

    if (this.publisher) {
      disconnectPromises.push(
        this.publisher
          .quit()
          .then(() => {
            console.log("✅ Redis Publisher 연결 종료");
          })
          .catch(() => {
            this.publisher?.disconnect();
          })
      );
      this.publisher = null;
    }

    await Promise.allSettled(disconnectPromises);
  }
}

// Singleton 인스턴스
const manager = RedisManager.getInstance();

// 내보내기
export const redisClient = manager.getClient();
export const redisSubscriber = manager.getSubscriber();
export const redisPublisher = manager.getPublisher();
export const testRedisConnection = () => manager.testConnection();
export const enableKeyspaceNotifications = () =>
  manager.enableKeyspaceNotifications();
export const disconnectRedis = () => manager.disconnect();
