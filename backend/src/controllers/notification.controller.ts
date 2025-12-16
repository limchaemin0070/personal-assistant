// SSE 커넥션을 사용자 ID에 매핑
import { Request, Response, NextFunction } from "express";
import { UserNotFoundError } from "../errors/BusinessError";
import { asyncHandler } from "../utils/asyncHandler";
import { redisSubscriber } from "../config/redis";

export const notificationStreamHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    // notification.service.ts의 sendPubSub과 채널 이름 일치시킴
    const channel = `alarm:trigger:user:${userId}`;

    if (!userId) {
      throw new UserNotFoundError();
    }

    // ioredis의 올바른 구독 방식: message 이벤트 리스너 사용
    const messageHandler = (receivedChannel: string, message: string) => {
      // 해당 채널의 메시지만 처리
      if (receivedChannel === channel && message) {
        res.write(`event: alarm\ndata: ${message}\n\n`);
      }
    };

    // message 이벤트 리스너 등록 (메시지 수신 전용)
    redisSubscriber.on("message", messageHandler);

    // 채널 구독
    await redisSubscriber.subscribe(channel);

    const cleanup = () => {
      // 이벤트 리스너 제거
      redisSubscriber.removeListener("message", messageHandler);
      // 이 요청에서만 구독했던 채널만 해제
      redisSubscriber.unsubscribe(channel).catch(() => {
        // 로그만 삼키고 SSE 스트림 정리에만 집중
      });
    };

    req.on("close", cleanup);
    req.on("end", cleanup);
  }
);
