import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getRemindersByUserId,
  createReminder,
  updateReminder,
  patchReminderComplete,
  deleteReminder,
} from "../controllers/reminder.controller";

const router = Router();

// 유저ID로 리마인더 목록 조회 (인증 필요)
router.get("/", authMiddleware, getRemindersByUserId);
// 리마인더 생성 (인증 필요)
router.post("/", authMiddleware, createReminder);
// 리마인더 수정 (인증 필요)
router.put("/:id", authMiddleware, updateReminder);
// 리마인더 완료 상태만 업데이트 (인증 필요)
router.patch("/:id/complete", authMiddleware, patchReminderComplete);
// 리마인더 삭제 (인증 필요)
router.delete("/:id", authMiddleware, deleteReminder);

export default router;


