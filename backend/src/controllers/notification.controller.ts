// SSE 커넥션을 사용자 ID에 매핑
import { Request, Response, NextFunction } from "express";
import { UserNotFoundError } from "../errors/BusinessError";
import { asyncHandler } from "../utils/asyncHandler";
import { redisSubscriber } from "../config/redis";
import { REDIS_KEYS } from "../constants/redis-keys";

export const notificationStreamHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const channel = REDIS_KEYS.alarmTriggerChannel(userId!);

    if (!userId) {
      throw new UserNotFoundError();
    }

    const messageHandler = (receivedChannel: string, message: string) => {
      if (receivedChannel === channel && message) {
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
