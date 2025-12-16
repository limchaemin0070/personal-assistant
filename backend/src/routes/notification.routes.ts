import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { sseInitMiddleware } from "../middleware/sseInitMiddleware";
import { notificationStreamHandler } from "../controllers/notification.controller";

const router = Router();

router.get(
  "/stream",
  authMiddleware,
  sseInitMiddleware,
  notificationStreamHandler
);

export default router;
