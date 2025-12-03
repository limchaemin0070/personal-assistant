import { FormInput } from '@/components/auth/FormInput';

export interface EmailAuthSectionProps {
    email: string;
    verificationCode: string;
    isVerificationCodeSent: boolean;
    isEmailVerified: boolean;
    errors: {
        email?: string;
        code?: string;
    };
    onEmailChange: (value: string) => void;
    onAuthNumChange: (value: string) => void;
    onEmailBlur: (value: string) => void;
    onCodeBlur: (value: string) => void;
    onEmailVerification: () => void;
    onVerifyCode: () => void;
    disabled?: boolean;
}

export const EmailAuthSection = ({
    email,
    verificationCode,
    isVerificationCodeSent,
    isEmailVerified,
    errors,
    onEmailChange,
    onAuthNumChange,
    onEmailBlur,
    onCodeBlur,
    onEmailVerification,
    onVerifyCode,
    disabled = false,
}: EmailAuthSectionProps) => {
    const isDisabled = disabled || isEmailVerified;

    return (
        <>
            <div className="flex flex-row gap-2">
                <FormInput
                    type="email"
                    value={email}
                    onChange={onEmailChange}
                    onBlur={onEmailBlur}
                    placeholder="이메일을 입력하세요"
                    error={errors.email}
                    disabled={isDisabled}
                />
                <button
                    type="button"
                    onClick={onEmailVerification}
                    className="btn-primary-filled w-[30%]"
                    disabled={isDisabled}
                >
                    인증
                </button>
            </div>
            {isVerificationCodeSent && !isEmailVerified && (
                <>
                    <FormInput
                        type="text"
                        value={verificationCode}
                        onChange={onAuthNumChange}
                        onBlur={onCodeBlur}
                        placeholder="인증번호를 입력하세요"
                        error={errors.code}
                    />
                    <button
                        type="button"
                        onClick={onVerifyCode}
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
        </>
    );
};
