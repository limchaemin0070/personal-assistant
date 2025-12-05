import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getSchedulesByUserId } from "../controllers/schedule.controller";

const router = Router();

// 유저ID로 스케줄 목록 조회 (인증 필요)
router.get("/", authMiddleware, getSchedulesByUserId);

export default router;
