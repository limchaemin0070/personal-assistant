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

    // 초기 연결 확인 메시지
    res.write("event: connected\ndata: true\n\n");

    const messageHandler = (receivedChannel: string, message: string) => {
      if (receivedChannel === channel && message && !res.writableEnded) {
        res.write(`event: alarm\ndata: ${message}\n\n`);
      }
    };

    redisSubscriber.on("message", messageHandler);

    await redisSubscriber.subscribe(channel);

    const cleanup = () => {
      redisSubscriber.removeListener("message", messageHandler);
      redisSubscriber.unsubscribe(channel).catch(() => {});
    };

    req.on("close", cleanup);
    req.on("end", cleanup);
  }
);
