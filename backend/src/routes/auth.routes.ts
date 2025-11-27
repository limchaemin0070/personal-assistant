import { Router } from "express";
import {
  sendVerificationCode,
  verifyCode,
  signUp,
} from "../controllers/auth.controller";

const router = Router();

// 이메일 인증 코드 발송
router.post("/email-verifications", sendVerificationCode);
// 이메일 인증 코드 검증
router.post("/email-verifications/verify", verifyCode);
// 회원가입
router.post("/sign-up", signUp);

export default router;
