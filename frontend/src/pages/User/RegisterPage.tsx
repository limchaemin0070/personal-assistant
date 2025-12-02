import React, { useState } from 'react';
import { authService } from '@/services/auth.service';
import {
    validateCode,
    validateConfirmPassword,
    validateEmail,
    validateNickname,
    validatePassword,
    validateSignUp,
} from '@/utils/validation/authValidator';

export const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerificationCodeSent, setIsVerificationCodeSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleEmailVerification = async () => {
        const emailResult = validateEmail(email);
        if (!emailResult.isValid) {
            setErrors((prev) => ({ ...prev, email: emailResult.error || '' }));
            return;
        }

        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.email;
            return newErrors;
        });

        const response = await authService.sendVerificationCode(email);
        console.log('인증번호 전송 응답:', response);
        setIsVerificationCodeSent(true);
        setIsEmailVerified(false);
        setVerificationCode('');
    };

    const handleVerifyCode = async () => {
        const codeResult = validateCode(verificationCode);
        if (!codeResult.isValid) {
            setErrors((prev) => ({ ...prev, code: codeResult.error || '' }));
            return;
        }

        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.code;
            return newErrors;
        });

        const response = await authService.verifyCode(email, verificationCode);
        console.log('인증번호 검증 응답:', response);
        setIsEmailVerified(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isEmailVerified) {
            setErrors((prev) => ({
                ...prev,
                email: '이메일 인증을 완료해주세요.',
            }));
            return;
        }

        const validation = validateSignUp({
            email,
            password,
            confirmPassword,
            nickname,
        });

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setErrors({});

        const response = await authService.register(email, password, nickname);
        console.log('회원가입 응답:', response);
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
                    onBlur={(e) => {
                        const result = validateEmail(e.target.value);
                        if (!result.isValid && result.error) {
                            setErrors((prev) => ({
                                ...prev,
                                email: result.error || '',
                            }));
                        } else {
                            setErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors.email;
                                return newErrors;
                            });
                        }
                    }}
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
                            onBlur={(e) => {
                                const result = validateCode(e.target.value);
                                if (!result.isValid && result.error) {
                                    setErrors((prev) => ({
                                        ...prev,
                                        code: result.error || '',
                                    }));
                                } else {
                                    setErrors((prev) => {
                                        const newErrors = { ...prev };
                                        delete newErrors.code;
                                        return newErrors;
                                    });
                                }
                            }}
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
                    onBlur={(e) => {
                        const result = validatePassword(e.target.value);
                        if (!result.isValid && result.error) {
                            setErrors((prev) => ({
                                ...prev,
                                password: result.error || '',
                            }));
                        } else {
                            setErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors.password;
                                return newErrors;
                            });
                        }
                    }}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full px-4 py-2 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-sample-blue"
                />
                <input
                    type="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={(e) => {
                        const result = validateConfirmPassword(
                            password,
                            e.target.value,
                        );
                        if (!result.isValid && result.error) {
                            setErrors((prev) => ({
                                ...prev,
                                confirmPassword: result.error || '',
                            }));
                        } else {
                            setErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors.confirmPassword;
                                return newErrors;
                            });
                        }
                    }}
                    placeholder="비밀번호를 한번 더 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sample-blue"
                />
                <input
                    type="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onBlur={(e) => {
                        const result = validateNickname(e.target.value);
                        if (!result.isValid && result.error) {
                            setErrors((prev) => ({
                                ...prev,
                                nickname: result.error || '',
                            }));
                        } else {
                            setErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors.nickname;
                                return newErrors;
                            });
                        }
                    }}
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
