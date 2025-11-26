import { Router } from "express";
import { sendVerificationCode } from "../controllers/auth.controller";

const router = Router();

// 이메일 인증 코드 발송
router.post("/sendEmailVerification", sendVerificationCode);

export default router;
