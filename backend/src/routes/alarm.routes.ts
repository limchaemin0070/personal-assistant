import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getAlarmsByUserId,
  createAlarm,
  updateAlarm,
  patchAlarmActive,
  deleteAlarm,
} from "../controllers/alarm.controller";

const router = Router();

// 유저ID로 알람 목록 조회 (인증 필요)
router.get("/", authMiddleware, getAlarmsByUserId);
// 알람 생성 (인증 필요)
router.post("/", authMiddleware, createAlarm);
// 알람 수정 (인증 필요)
router.put("/:id", authMiddleware, updateAlarm);
// 알람 활성 상태만 업데이트 (인증 필요)
router.patch("/:id/active", authMiddleware, patchAlarmActive);
// 알람 삭제 (인증 필요)
router.delete("/:id", authMiddleware, deleteAlarm);

export default router;

