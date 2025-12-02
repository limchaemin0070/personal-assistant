import React, { useState } from 'react';
import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import {
    validateEmail,
    validatePassword,
} from '@/utils/validation/authValidator';
import { useToastStore } from '@/hooks/useToastStore';
import type { ApiErrorResponse } from '@/utils/api';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const { addToast } = useToastStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = {
            email: validateEmail(email),
            password: validatePassword(password),
        };

        const validationErrors: Record<string, string> = {};
        if (!validation.email.isValid && validation.email.error) {
            validationErrors.email = validation.email.error;
        }
        if (!validation.password.isValid && validation.password.error) {
            validationErrors.password = validation.password.error;
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            const firstError = Object.values(validationErrors)[0];
            if (firstError) {
                addToast(firstError, 'error');
            }
            return;
        }

        setErrors({});

        try {
            const response = await authService.login(email, password);
            // eslint-disable-next-line no-console
            console.log('로그인 응답:', response);
            addToast('로그인에 성공했습니다.', 'success');
            navigate('/');
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorResponse>;
            const errorMessage =
                axiosError.response?.data?.error?.message ||
                axiosError.message ||
                '로그인에 실패했습니다.';
            addToast(errorMessage, 'error');
        }
    };

    return (
        <div className="flex flex-row items-center w-full h-full min-[]:">
            {/* 이미지 컨테이너 */}
            <div className="flex items-center justify-center h-full bg-gradient-primary w-[60%] " />
            {/* 폼 데이터 영역 */}
            <div className="flex flex-col items-center justify-center gap-5 h-full flex-1 px-12">
                <h2 className="text-2xl text-sample-blue font-bold py-3 w-full">
                    로그인
                </h2>
                <form
                    className="flex flex-col w-full gap-2"
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
                        className={errors.email ? 'input-error' : 'input-base'}
                    />
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
                        className={
                            errors.password ? 'input-error' : 'input-base'
                        }
                    />
                    <button type="submit" className="btn-primary-filled">
                        로그인
                    </button>
                    <div className="flex justify-center mt-2">
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="text-sm text-sample-blue hover:underline"
                        >
                            회원가입
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
