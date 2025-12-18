// SSE 커넥션을 사용자 ID에 매핑
import { Request, Response, NextFunction } from "express";
import { UserNotFoundError } from "../errors/BusinessError";
import { asyncHandler } from "../utils/asyncHandler";
import { redisSubscriber } from "../config/redis";
import { REDIS_KEYS } from "../constants/redis-keys";
import { buildSuccess } from "../utils/response";
import { generateSSEToken, expiresInToMs } from "../utils/authentication/jwt";
import { env } from "../config/env";

export const issueSSEToken = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const email = req.user?.email;

    if (!userId || !email) {
      throw new UserNotFoundError();
    }

    // SSE 전 전용 토큰 생성 (Stateless, JWT 방식)
    const sseToken = generateSSEToken({ userId, email });

    // 만료 시간 계산
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
    const channel = REDIS_KEYS.alarmTriggerChannel(userId!);

    if (!userId) {
      throw new UserNotFoundError();
    }

    // [디버깅] 연결 식별을 위한 고유 ID 생성
    const connectionId = Math.random().toString(36).substring(7);
    console.log(
      `[SSE-${connectionId}] 연결 시도: UserID=${userId}, Channel=${channel}`
    );

    // 초기 연결 확인 메시지
    res.write("event: connected\ndata: true\n\n");

    const messageHandler = (receivedChannel: string, message: string) => {
      // [디버깅] 메시지 수신 확인
      if (receivedChannel === channel) {
        console.log(`[SSE-${connectionId}] Redis 메시지 수신 (본인 채널)`);
      }

      if (receivedChannel === channel && message && !res.writableEnded) {
        res.write(`event: alarm\ndata: ${message}\n\n`);
      }
    };

    redisSubscriber.on("message", messageHandler);

    // [디버깅] 현재 공유 Subscriber의 리스너 수 확인
    const listenerCount = redisSubscriber.listenerCount("message");
    console.log(
      `[SSE-${connectionId}] 현재 공유 Subscriber 리스너 수: ${listenerCount}`
    );

    await redisSubscriber.subscribe(channel);
    console.log(`[SSE-${connectionId}] Redis 채널 구독 시작: ${channel}`);

    const cleanup = () => {
      console.log(
        `[SSE-${connectionId}] 연결 종료 및 클린업 시작 (UserID=${userId})`
      );

      redisSubscriber.removeListener("message", messageHandler);

      // [디버깅] unsubscribe 호출 전 알림
      console.log(
        `[SSE-${connectionId}] Redis unsubscribe 호출 예정 (Channel: ${channel})`
      );

      redisSubscriber.unsubscribe(channel).catch((err) => {
        console.error(`[SSE-${connectionId}] unsubscribe 에러:`, err);
      });
    };

    req.on("close", cleanup);
    req.on("end", cleanup);
  }
);
