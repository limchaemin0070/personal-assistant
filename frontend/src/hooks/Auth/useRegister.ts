import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import {
    validateCode,
    validateConfirmPassword,
    validateEmail,
    validateSignUp,
} from '@/utils/validation/authValidator';
import { useToastStore } from '@/hooks/useToastStore';

export const useRegister = () => {
    const navigate = useNavigate();
    const { addToast } = useToastStore();
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nickname, setNickname] = useState('');

    const [isVerificationCodeSent, setIsVerificationCodeSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    // 필드 블러 핸들러
    const handleFieldBlur = (
        fieldName: string,
        value: string,
        validator: (value: string) => { isValid: boolean; error?: string },
    ) => {
        const result = validator(value);
        if (!result.isValid && result.error) {
            setErrors((prev) => ({
                ...prev,
                [fieldName]: result.error || '',
            }));
        } else {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    const setFieldError = (fieldName: string, error: string) => {
        setErrors((prev) => ({
            ...prev,
            [fieldName]: error,
        }));
    };

    const clearFieldError = (fieldName: string) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    };

    const setErrorsFromValidation = (
        validationErrors: Record<string, string>,
    ) => {
        setErrors(validationErrors);
    };

    const clearAllErrors = () => {
        setErrors({});
    };

    // 비밀번호 확인 필드 블러 핸들러
    const handleConfirmPasswordBlur = (value: string) => {
        const result = validateConfirmPassword(password, value);
        if (!result.isValid && result.error) {
            setFieldError('confirmPassword', result.error || '');
        } else {
            clearFieldError('confirmPassword');
        }
    };

    // 이메일 인증번호 전송
    const handleEmailVerification = async () => {
        const emailResult = validateEmail(email);
        if (!emailResult.isValid) {
            const errorMessage =
                emailResult.error || '이메일 형식이 올바르지 않습니다.';
            setFieldError('email', errorMessage);
            addToast(errorMessage, 'error');
            return;
        }

        clearFieldError('email');

        try {
            const response = await authService.sendVerificationCode(email);
            // eslint-disable-next-line no-console
            console.log('인증번호 전송 응답:', response);
            setIsVerificationCodeSent(true);
            setIsEmailVerified(false);
            setVerificationCode('');
            addToast('인증번호가 전송되었습니다.', 'success');
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('에러: ', error);
            addToast('알 수 없는 오류가 발생했습니다.', 'error');
        }
    };

    // 이메일 인증번호 검증
    const handleVerifyCode = async () => {
        const codeResult = validateCode(verificationCode);
        if (!codeResult.isValid) {
            const errorMessage =
                codeResult.error || '인증번호 형식이 올바르지 않습니다.';
            setFieldError('code', errorMessage);
            addToast(errorMessage, 'error');
            return;
        }

        clearFieldError('code');

        try {
            const response = await authService.verifyCode(
                email,
                verificationCode,
            );
            // eslint-disable-next-line no-console
            console.log('인증번호 검증 응답:', response);
            setIsEmailVerified(true);
            addToast('이메일 인증이 완료되었습니다.', 'success');
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('에러: ', error);
            addToast('알 수 없는 오류가 발생했습니다.', 'error');
        }
    };

    // 회원가입 제출
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isEmailVerified) {
            setFieldError('email', '이메일 인증을 완료해주세요.');
            addToast('이메일 인증을 완료해주세요.', 'warning');
            return;
        }

        const validation = validateSignUp({
            email,
            password,
            confirmPassword,
            nickname,
        });

        if (!validation.isValid) {
            setErrorsFromValidation(validation.errors);
            const firstError = Object.values(validation.errors)[0];
            if (firstError) {
                addToast(firstError, 'error');
            }
            return;
        }

        clearAllErrors();

        try {
            const response = await authService.register(
                email,
                password,
                nickname,
            );
            // eslint-disable-next-line no-console
            console.log('회원가입 응답:', response);
            addToast('회원가입이 완료되었습니다.', 'success');
            navigate('/login');
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('에러: ', error);
            addToast('알 수 없는 오류가 발생했습니다.', 'error');
        }
    };

    return {
        email,
        verificationCode,
        password,
        confirmPassword,
        nickname,
        isVerificationCodeSent,
        isEmailVerified,
        errors,

        setEmail,
        setVerificationCode,
        setPassword,
        setConfirmPassword,
        setNickname,

        handleEmailVerification,
        handleVerifyCode,

        handleFieldBlur,
        handleConfirmPasswordBlur,
        handleSubmit,

        navigate,
    };
};
