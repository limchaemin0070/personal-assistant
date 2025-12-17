// hooks/Auth/useRegisterForm.ts
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    registerFormSchema,
    type RegisterFormData,
} from '@/schemas/authSchema';
import { useSendVerificationCode, useVerifyCode, useRegister } from './useRegister';
import { useToastStore } from '@/hooks/useToastStore';

export const useRegisterForm = () => {
    const { addToast } = useToastStore();

    const [isVerificationCodeSent, setIsVerificationCodeSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    const sendVerificationCodeMutation = useSendVerificationCode();
    const verifyCodeMutation = useVerifyCode();
    const registerMutation = useRegister();

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            email: '',
            verificationCode: '',
            password: '',
            confirmPassword: '',
            nickname: '',
        },
        mode: 'onChange',
    });

    // 이메일 인증번호 전송
    const handleEmailVerification = async () => {
        const email = form.getValues('email');
        const emailResult = await form.trigger('email');

        if (!emailResult) {
            addToast('이메일 형식을 확인해주세요.', 'error');
            return;
        }

        sendVerificationCodeMutation.mutate(
            { email },
            {
                onSuccess: () => {
                    setIsVerificationCodeSent(true);
                    setIsEmailVerified(false);
                    form.setValue('verificationCode', '');
                },
            },
        );
    };

    // 이메일 인증번호 검증
    const handleVerifyCode = async () => {
        const email = form.getValues('email');
        const verificationCode = form.getValues('verificationCode');
        const codeResult = await form.trigger('verificationCode');

        if (!codeResult) {
            addToast('인증번호 형식을 확인해주세요.', 'error');
            return;
        }

        verifyCodeMutation.mutate(
            { email, code: verificationCode },
            {
                onSuccess: () => {
                    setIsEmailVerified(true);
                },
            },
        );
    };

    // 회원가입 제출
    const handleSubmit = form.handleSubmit(async (data: RegisterFormData) => {
        if (!isEmailVerified) {
            form.setError('email', {
                type: 'manual',
                message: '이메일 인증을 완료해주세요.',
            });
            addToast('이메일 인증을 완료해주세요.', 'warning');
            return;
        }

        registerMutation.mutate({
            email: data.email,
            password: data.password,
            nickname: data.nickname,
        });
    });

    return {
        form,
        handleSubmit,
        isVerificationCodeSent,
        isEmailVerified,
        handleEmailVerification,
        handleVerifyCode,
        isSubmitting:
            form.formState.isSubmitting ||
            sendVerificationCodeMutation.isPending ||
            verifyCodeMutation.isPending ||
            registerMutation.isPending,
    };
};

