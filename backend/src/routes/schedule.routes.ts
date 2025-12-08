import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getSchedulesByUserId,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../controllers/schedule.controller";

const router = Router();

// 유저ID로 스케줄 목록 조회 (인증 필요)
router.get("/", authMiddleware, getSchedulesByUserId);
// 스케줄 생성 (인증 필요)
router.post("/", authMiddleware, createSchedule);
// 스케줄 수정 (인증 필요)
router.put("/:id", authMiddleware, updateSchedule);
// 스케줄 삭제 (인증 필요)
router.delete("/:id", authMiddleware, deleteSchedule);

export default router;
