import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/CustomErrors";
import { verifyAccessToken } from "../utils/authentication/jwt";
import { InvalidTokenError } from "../errors/AuthError";

type UserLike = { id: string };

export function sseInitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 이미 compression 등이 글로벌로 깔려 있다면, SSE에서는 비활성화 권장
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Nginx 버퍼링 방지

  // 소켓 설정 최적화
  req.socket.setKeepAlive(true);
  req.socket.setTimeout(0);

  // TODO : CORS 설정

  // 헤더 즉시 전송 (Express 4+)
  if (typeof (res as any).flushHeaders === "function") {
    (res as any).flushHeaders();
  } else if (typeof (res as any).flush === "function") {
    // compression 미들웨어에서 제공하는 flush
    (res as any).flush();
  }

  // 핑 15~30초
  const heartbeatMs = 15000;
  const heartbeat = setInterval(() => {
    if (!res.writableEnded) {
      res.write(`event: ping\ndata: {}\n\n`);
    }
  }, heartbeatMs);

  // 커넥션 종료 시 정리
  const cleanUp = () => {
    clearInterval(heartbeat);
  };
  req.on("close", cleanUp);
  req.on("end", cleanUp);
  res.on("close", cleanUp);

  (req as any).sse = { startedAt: Date.now() };
  next();
}
