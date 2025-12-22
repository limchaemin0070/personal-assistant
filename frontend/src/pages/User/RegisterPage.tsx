import { useNavigate } from 'react-router-dom';
import { FormProvider } from 'react-hook-form';
import { FormInput } from '@/components/common/Form/input';
import { EmailAuthSection } from '@/components/auth/EmailAuthSection';
import { useRegisterForm } from '@/hooks/Auth/useRegisterForm';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const {
        form,
        handleSubmit,
        isVerificationCodeSent,
        isEmailVerified,
        handleEmailVerification,
        handleVerifyCode,
        isSubmitting,
    } = useRegisterForm();

    return (
        <div className="flex flex-row items-center w-full h-full min-[]:">
            {/* 이미지 컨테이너 */}
            <div className="flex items-center justify-center h-full bg-gradient-primary w-[60%] " />
            {/* 폼 데이터 영역 */}
            <div className="flex flex-col items-center justify-center gap-5 h-full flex-1 px-12">
                <h2 className="text-2xl text-sample-blue font-bold py-3 w-full">
                    회원가입
                </h2>
                <FormProvider {...form}>
                    <form
                        className="flex flex-col w-full gap-2"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <EmailAuthSection
                            isVerificationCodeSent={isVerificationCodeSent}
                            isEmailVerified={isEmailVerified}
                            onEmailVerification={handleEmailVerification}
                            onVerifyCode={handleVerifyCode}
                            disabled={isEmailVerified}
                        />
                        <FormInput
                            type="password"
                            name="password"
                            placeholder="비밀번호를 입력하세요"
                            autoComplete="new-password"
                            disabled={isSubmitting}
                        />
                        <FormInput
                            type="password"
                            name="confirmPassword"
                            placeholder="비밀번호를 한번 더 입력하세요"
                            autoComplete="new-password"
                            disabled={isSubmitting}
                        />
                        <FormInput
                            type="text"
                            name="nickname"
                            placeholder="사용할 닉네임을 입력하세요"
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            className="btn-primary-filled"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '회원가입 중...' : '회원가입'}
                        </button>
                        <div className="flex justify-center mt-2">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-sm text-sample-blue hover:underline"
                            >
                                로그인
                            </button>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
};
