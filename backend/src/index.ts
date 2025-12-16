// src/server.ts
import app from "./app";
import sequelize from "./config/database";
import { env } from "./config/env";
import {
  testRedisConnection,
  enableKeyspaceNotifications,
  disconnectRedis,
} from "./config/redis";
import { schedulerService } from "./services/notification/scheduler.service";

console.log("🔍 환경변수 확인:");
console.log("REDIS_URL:", process.env.REDIS_URL ? "설정됨" : "없음");
console.log("REDIS_URL 길이:", process.env.REDIS_URL?.length);

/**
 * MySQL 연결
 */
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ MySQL 연결 성공 (${env.NODE_ENV})`);
    console.log(`   연결된 DB: ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);
  } catch (error) {
    console.error("❌ MySQL 연결 실패:", error);
    throw error;
  }
};

/**
 * Redis 연결 및 초기화
 */
const connectRedis = async () => {
  try {
    console.log("🔍 Redis 연결 확인 중...");

    // Redis 연결 테스트
    const isConnected = await testRedisConnection();

    if (!isConnected) {
      throw new Error("Redis 연결 실패");
    }

    // Keyspace Notifications 활성화 (알람 만료 이벤트 감지용)
    await enableKeyspaceNotifications();

    // // Redis 스케줄러 초기화
    // console.log("🔍 Redis 스케줄러 초기화 중...");
    // await RedisScheduler.initialize();

    // // 알람 복구 (서버 재시작 시 활성 알람 재스케줄링)
    // console.log("🔍 알람 복구 중...");
    // await AlarmService.recoverAlarms();

    console.log("✅ Redis 초기화 완료\n");
  } catch (error) {
    console.error("❌ Redis 초기화 실패:", error);
    throw error;
  }
};

/**
 * Graceful Shutdown 설정
 */
const setupGracefulShutdown = (server: any) => {
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 ${signal} 신호 수신 - 서버 종료 시작...\n`);

    // HTTP 서버 종료 (새 요청 거부)
    server.close(() => {
      console.log("✅ HTTP 서버 종료");
    });

    try {
      // Redis 연결 종료
      await disconnectRedis();

      // MySQL 연결 종료
      console.log("🔄 MySQL 연결 종료 중...");
      await sequelize.close();
      console.log("✅ MySQL 연결 종료 완료\n");

      console.log("✅ 서버 종료 완료");
      process.exit(0);
    } catch (error) {
      console.error("❌ 서버 종료 중 오류:", error);
      process.exit(1);
    }
  };

  // SIGTERM (클라우드 플랫폼에서 사용)
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  // SIGINT (Ctrl+C)
  process.on("SIGINT", () => shutdown("SIGINT"));

  // 예상치 못한 에러 처리
  process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection:", promise, "reason:", reason);
  });

  process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
    shutdown("UNCAUGHT_EXCEPTION");
  });
};

/**
 * 서버 시작
 */
export const startServer = async () => {
  try {
    console.log("🚀 서버 시작 중...\n");
    console.log(`📌 환경: ${env.NODE_ENV}`);
    console.log(`📌 포트: ${env.PORT}\n`);

    // MySQL 연결
    await connectDB();

    // Redis 연결 및 초기화
    await connectRedis();

    // 스케줄링
    await schedulerService.initialize();

    // HTTP 서버 시작
    const server = app.listen(env.PORT, () => {
      console.log("═══════════════════════════════════════");
      console.log(`✅ 서버 시작 완료`);
      console.log(`📡 주소: http://localhost:${env.PORT}`);
      console.log(`🌍 환경: ${env.NODE_ENV}`);
      console.log("═══════════════════════════════════════\n");
    });

    // Graceful Shutdown 설정
    setupGracefulShutdown(server);
  } catch (error) {
    console.error("❌ 서버 시작 실패:", error);
    process.exit(1);
  }
};

// 테스트 환경이 아닐 때만 서버 시작
if (process.env.NODE_ENV !== "test") {
  startServer();
}
