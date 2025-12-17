import { useNavigate } from 'react-router-dom';
import { FormProvider } from 'react-hook-form';
import { FormInput } from '@/components/common/Form/input';
import { useLoginForm } from '@/hooks/Auth/useLoginForm';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { form, handleSubmit, isSubmitting } = useLoginForm();

    return (
        <div className="flex flex-row items-center w-full h-full min-[]:">
            {/* 이미지 컨테이너 */}
            <div className="flex items-center justify-center h-full bg-gradient-primary w-[60%] " />
            <div className="flex flex-col items-center justify-center gap-5 h-full flex-1 px-12">
                <h2 className="text-2xl text-sample-blue font-bold py-3 w-full">
                    로그인
                </h2>
                <FormProvider {...form}>
                    <form
                        className="flex flex-col w-full gap-2"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <FormInput
                            type="email"
                            name="email"
                            placeholder="이메일을 입력하세요"
                            disabled={isSubmitting}
                        />
                        <FormInput
                            type="password"
                            name="password"
                            placeholder="비밀번호를 입력하세요"
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            className="btn-primary-filled"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '로그인 중...' : '로그인'}
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
                </FormProvider>
            </div>
        </div>
    );
};
