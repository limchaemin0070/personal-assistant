import React, { useState } from 'react';
import { authService } from '@/services/auth.service';
// TODO: 이후 이슈에서 프론트엔드 유효성 검증을 사용할 예정
// import { ValidationError } from '@/utils/validation/ValidationError';
// import { validateSignUp } from '@/utils/validation/authValidator';

export const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerificationCodeSent, setIsVerificationCodeSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    const handleEmailVerification = async () => {
        // TODO: 이후 이슈에서 ValidationError 기반 프론트 유효성 검증 추가
        const response = await authService.sendVerificationCode(email);
        console.log('인증번호 전송 응답:', response);
        setIsVerificationCodeSent(true);
        setIsEmailVerified(false);
        setVerificationCode('');
    };

    const handleVerifyCode = async () => {
        // TODO: 이후 이슈에서 ValidationError 기반 프론트 유효성 검증 추가
        const response = await authService.verifyCode(email, verificationCode);
        console.log('인증번호 검증 응답:', response);
        setIsEmailVerified(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // TODO: 이후 이슈에서 프론트 유효성 검증(이메일 인증 여부 포함) 추가
        const response = await authService.register(email, password, nickname);
        console.log('회원가입 응답:', response);
        // TODO: 회원가입 성공 UX 개선 (토스트, 페이지 이동 등)
    };

    return (
        <div className="flex flex-col items-center gap-5 w-full h-full my-[50px] px-5">
            <h2 className="text-2xl text-center text-sample-blue font-bold py-3 ">
                회원가입 페이지
            </h2>
            <form
                className="flex flex-col gap-2 w-full"
                onSubmit={handleSubmit}
                noValidate
            >
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일을 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sample-blue"
                />
                <button
                    type="button"
                    onClick={handleEmailVerification}
                    className="btn-primary-filled"
                    disabled={isEmailVerified}
                >
                    인증번호 전송
                </button>
                {isVerificationCodeSent && !isEmailVerified && (
                    <>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) =>
                                setVerificationCode(e.target.value)
                            }
                            placeholder="인증번호를 입력하세요"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sample-blue"
                        />
                        <button
                            type="button"
                            onClick={handleVerifyCode}
                            className="btn-primary-filled"
                        >
                            인증번호 확인
                        </button>
                    </>
                )}
                {isEmailVerified && (
                    <div className="text-green-600 text-sm">
                        이메일 인증이 완료되었습니다.
                    </div>
                )}
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full px-4 py-2 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-sample-blue"
                />
                <input
                    type="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호를 한번 더 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sample-blue"
                />
                <input
                    type="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="사용할 닉네임을 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sample-blue"
                />
                <button type="submit" className="btn-primary-filled">
                    회원가입 신청 버튼
                </button>
            </form>
        </div>
    );
};
