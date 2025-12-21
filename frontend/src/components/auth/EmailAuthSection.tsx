import { FormInput } from '@/components/common/Form/input';

export interface EmailAuthSectionProps {
    isVerificationCodeSent: boolean;
    isEmailVerified: boolean;
    onEmailVerification: () => void;
    onVerifyCode: () => void;
    disabled?: boolean;
}

export const EmailAuthSection = ({
    isVerificationCodeSent,
    isEmailVerified,
    onEmailVerification,
    onVerifyCode,
    disabled = false,
}: EmailAuthSectionProps) => {
    const isDisabled = disabled || isEmailVerified;

    return (
        <>
            <div className="flex flex-row gap-2 items-start">
                <div className="flex-1 [&_.input-group]:mb-0">
                    <FormInput
                        type="email"
                        name="email"
                        placeholder="이메일을 입력하세요"
                        disabled={isDisabled}
                    />
                </div>
                <button
                    type="button"
                    onClick={onEmailVerification}
                    className="btn-primary-filled w-[30%] self-start"
                    disabled={isDisabled}
                >
                    인증
                </button>
            </div>
            {isVerificationCodeSent && !isEmailVerified && (
                <>
                    <FormInput
                        type="text"
                        name="verificationCode"
                        placeholder="인증번호를 입력하세요"
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
