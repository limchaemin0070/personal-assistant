import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormInput } from '@/components/auth/FormInput';
import { useLogin } from '@/hooks/Auth/useLogin';

export const LoginPage = () => {
    const navigate = useNavigate();
    const loginMutation = useLogin();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        loginMutation.mutate({ email, password });
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
                    <FormInput
                        type="email"
                        name="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="이메일을 입력하세요"
                    />
                    <FormInput
                        type="password"
                        name="password"
                        value={password}
                        onChange={setPassword}
                        placeholder="비밀번호를 입력하세요"
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
