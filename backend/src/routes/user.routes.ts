import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getUserInfo } from "../controllers/user.controller";

const router = Router();

// 사용자 정보 조회 (인증 필요)
router.get("/me", authMiddleware, getUserInfo);

export default router;
