import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getUserInfo,
  updateNotificationEnabled,
} from "../controllers/user.controller";

const router = Router();

// 사용자 정보 조회 (인증 필요)
router.get("/me", authMiddleware, getUserInfo);

// 사용자 알람 설정 업데이트 (인증 필요)
router.patch("/me/notification", authMiddleware, updateNotificationEnabled);

export default router;
