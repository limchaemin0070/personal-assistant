import { FormInput } from '@/components/auth/FormInput';
import { EmailAuthSection } from '@/components/auth/EmailAuthSection';
import { useRegister } from '@/hooks/useRegister';
import {
    validateCode,
    validateEmail,
    validateNickname,
    validatePassword,
} from '@/utils/validation/authValidator';

export const RegisterPage = () => {
    const {
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
    } = useRegister();

    return (
        <div className="flex flex-row items-center w-full h-full min-[]:">
            {/* 이미지 컨테이너 */}
            <div className="flex items-center justify-center h-full bg-gradient-primary w-[60%] " />
            {/* 폼 데이터 영역 */}
            <div className="flex flex-col items-center justify-center gap-5 h-full flex-1 px-12">
                <h2 className="text-2xl text-sample-blue font-bold py-3 w-full">
                    회원가입
                </h2>
                <form
                    className="flex flex-col w-full gap-2"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <EmailAuthSection
                        email={email}
                        verificationCode={verificationCode}
                        isVerificationCodeSent={isVerificationCodeSent}
                        isEmailVerified={isEmailVerified}
                        errors={errors}
                        onEmailChange={setEmail}
                        onAuthNumChange={setVerificationCode}
                        onEmailBlur={(value) => {
                            handleFieldBlur('email', value, validateEmail);
                        }}
                        onCodeBlur={(value) => {
                            handleFieldBlur('code', value, validateCode);
                        }}
                        onEmailVerification={handleEmailVerification}
                        onVerifyCode={handleVerifyCode}
                        disabled={isEmailVerified}
                    />
                    <FormInput
                        type="password"
                        value={password}
                        onChange={setPassword}
                        onBlur={(value) => {
                            handleFieldBlur(
                                'password',
                                value,
                                validatePassword,
                            );
                        }}
                        placeholder="비밀번호를 입력하세요"
                        error={errors.password}
                    />
                    <FormInput
                        type="password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        onBlur={handleConfirmPasswordBlur}
                        placeholder="비밀번호를 한번 더 입력하세요"
                        error={errors.confirmPassword}
                    />
                    <FormInput
                        type="text"
                        value={nickname}
                        onChange={setNickname}
                        onBlur={(value) => {
                            handleFieldBlur(
                                'nickname',
                                value,
                                validateNickname,
                            );
                        }}
                        placeholder="사용할 닉네임을 입력하세요"
                        error={errors.nickname}
                    />
                    <button type="submit" className="btn-primary-filled">
                        회원가입
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
            </div>
        </div>
    );
};
