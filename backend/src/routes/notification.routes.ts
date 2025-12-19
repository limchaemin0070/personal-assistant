import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { sseAuthMiddleware } from "../middleware/sseAuthMiddleware";
import {
  notificationStreamHandler,
  issueSSEToken,
} from "../controllers/notification.controller";

const router = Router();

router.get("/stream", sseAuthMiddleware, notificationStreamHandler);

// SSE 전용 토큰 발급
router.post("/sse-token", authMiddleware, issueSSEToken);

export default router;
