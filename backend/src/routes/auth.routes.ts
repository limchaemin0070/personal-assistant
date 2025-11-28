import { Router } from "express";
import {
  sendVerificationCode,
  verifyCode,
  signUp,
  login,
  refreshAccesstoken,
} from "../controllers/auth.controller";

const router = Router();

// 이메일 인증 코드 발송
router.post("/email-verifications", sendVerificationCode);
// 이메일 인증 코드 검증
router.post("/email-verifications/verify", verifyCode);
// 회원가입
router.post("/sign-up", signUp);
// 로그인
router.post("/login", login);
// 로그아웃

// 리프레시 토큰 갱신
router.post("/refresh", refreshAccesstoken);

export default router;
