// SSE 커넥션을 사용자 ID에 매핑
import { Request, Response, NextFunction } from "express";
import { UserNotFoundError } from "../errors/BusinessError";
import { asyncHandler } from "../utils/asyncHandler";
import { REDIS_KEYS } from "../constants/redis-keys";
import { buildSuccess } from "../utils/response";
import { generateSSEToken, expiresInToMs } from "../utils/authentication/jwt";
import { env } from "../config/env";
import { redisSubscriptionManager } from "../services/notification/sse-subscription.manager";

// SSE 토큰 관련
export const issueSSEToken = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const email = req.user?.email;

    if (!userId || !email) {
      throw new UserNotFoundError();
    }

    // TODO : 비즈니스로직 분리...?
    const sseToken = generateSSEToken({ userId, email });
    const expiresInSec = expiresInToMs(env.JWT_SSE_EXPIRES_IN) / 1000;
    const expiresAt = Date.now() + expiresInSec * 1000;

    res.status(200).json(
      buildSuccess("SSE_TOKEN_ISSUED", "SSE 토큰이 발급되었습니다.", {
        sseToken,
        expiresIn: expiresInSec,
        expiresAt,
      })
    );
  }
);

export const notificationStreamHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) throw new UserNotFoundError();

    const channel = REDIS_KEYS.alarmTriggerChannel(userId);
    const connectionId = Math.random().toString(36).substring(7);

    console.log(
      `[SSE-${connectionId}] 연결 시도: UserID=${userId}, Channel=${channel}`
    );

    // SSE 헤더 설정 (중복 제거: 미들웨어에서 설정하던 것들을 통합)
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Nginx 버퍼링 방지

    // 소켓 설정 최적화
    req.socket.setKeepAlive(true);
    req.socket.setTimeout(0);

    // 헤더 플러시
    if (typeof (res as any).flushHeaders === "function") {
      (res as any).flushHeaders();
    } else if (typeof (res as any).flush === "function") {
      (res as any).flush();
    }

    // 초기 연결 확인
    res.write("event: connected\ndata: true\n\n");

    // 리스너 정의 : 메시지 수신 시 실행될 콜백
    const messageListener = (receivedChannel: string, message: string) => {
      if (receivedChannel === channel && message && !res.writableEnded) {
        console.log(
          `[SSE-${connectionId}] 📨 메시지 전송: ${message.substring(0, 50)}...`
        );
        res.write(`event: alarm\ndata: ${message}\n\n`);
      }
    };

    //구독 : 리스너도 함께 등록
    try {
      await redisSubscriptionManager.subscribe(channel, messageListener);
      console.log(`[SSE-${connectionId}] ✅ 구독 완료: ${channel}`);
    } catch (error) {
      console.error(`[SSE-${connectionId}] ❌ 구독 실패:`, error);
      res.end();
      return;
    }

    // 핑/하트비트 설정 (연결 유지용)
    const heartbeatMs = 15000; // 15초
    const heartbeat = setInterval(() => {
      if (!res.writableEnded) {
        res.write(`event: ping\ndata: {}\n\n`);
      }
    }, heartbeatMs);

    // Cleanup
    let isCleanedUp = false;
    const cleanup = async () => {
      if (isCleanedUp) return;
      isCleanedUp = true;

      console.log(`[SSE-${connectionId}] 🔌 연결 종료 시작 (UserID=${userId})`);

      // 핑 중지
      clearInterval(heartbeat);

      try {
        await redisSubscriptionManager.unsubscribe(channel, messageListener);
        console.log(`[SSE-${connectionId}] ✅ 구독 해제 완료`);
      } catch (error) {
        console.error(`[SSE-${connectionId}] ❌ 구독 해제 실패:`, error);
      }

      if (!res.writableEnded) {
        res.end();
      }
    };

    req.on("close", cleanup);
    req.on("end", cleanup);
    res.on("close", cleanup);

    // 타임아웃
    req.setTimeout(1000 * 60 * 30); // 30분
  }
);
