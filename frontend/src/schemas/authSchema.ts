// schemas/authSchema.ts
import { z } from 'zod';
import { AUTH_INPUT_VALIDATION } from '@/constants/authInputValidation';

// 이메일 검증 스키마
export const emailSchema = z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .max(
        AUTH_INPUT_VALIDATION.EMAIL_MAX_LENGTH,
        `이메일은 ${AUTH_INPUT_VALIDATION.EMAIL_MAX_LENGTH}자 이하여야 합니다.`,
    )
    .regex(AUTH_INPUT_VALIDATION.EMAIL_REGEX, '올바른 이메일 형식이 아닙니다.');

// 인증번호 검증 스키마
export const verificationCodeSchema = z
    .string()
    .min(1, '인증번호를 입력해주세요.')
    .regex(
        AUTH_INPUT_VALIDATION.CODE_REGEX,
        '인증번호는 6자리 숫자여야 합니다.',
    );

// 비밀번호 검증 스키마
export const passwordSchema = z
    .string()
    .min(1, '비밀번호를 입력해주세요.')
    .min(
        AUTH_INPUT_VALIDATION.PASSWORD_MIN_LENGTH,
        `비밀번호는 최소 ${AUTH_INPUT_VALIDATION.PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`,
    );

// 닉네임 검증 스키마
export const nicknameSchema = z
    .string()
    .min(1, '닉네임을 입력해주세요.')
    .min(
        AUTH_INPUT_VALIDATION.NICKNAME_MIN_LENGTH,
        `닉네임은 최소 ${AUTH_INPUT_VALIDATION.NICKNAME_MIN_LENGTH}자 이상이어야 합니다.`,
    )
    .max(
        AUTH_INPUT_VALIDATION.NICKNAME_MAX_LENGTH,
        `닉네임은 최대 ${AUTH_INPUT_VALIDATION.NICKNAME_MAX_LENGTH}자 이하여야 합니다.`,
    )
    .refine(
        (val) => val.trim().length >= AUTH_INPUT_VALIDATION.NICKNAME_MIN_LENGTH,
        '닉네임은 공백만으로 구성될 수 없습니다.',
    );

// 로그인 폼 스키마
export const loginFormSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

// 회원가입 폼 스키마
export const registerFormSchema = z
    .object({
        email: emailSchema,
        verificationCode: verificationCodeSchema,
        password: passwordSchema,
        confirmPassword: z.string().min(1, '비밀번호 확인란을 입력해주세요.'),
        nickname: nicknameSchema,
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: '비밀번호가 일치하지 않습니다.',
        path: ['confirmPassword'],
    });

export type RegisterFormData = z.infer<typeof registerFormSchema>;
