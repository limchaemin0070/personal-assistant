import { Router } from "express";
import {
  sendVerificationCode,
  verifyCode,
} from "../controllers/auth.controller";

const router = Router();

// 이메일 인증 코드 발송
router.post("/email-verifications", sendVerificationCode);
// 이메일 인증 코드 검증
router.post("/email-verifications/verify", verifyCode);

export default router;
