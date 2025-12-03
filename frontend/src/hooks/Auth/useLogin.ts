import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { validateEmail } from '@/utils/validation/authValidator';
import { useToastStore } from '@/hooks/useToastStore';

export const useLogin = () => {
    const navigate = useNavigate();
    const { addToast } = useToastStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 로그인 제출
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 이메일 유효성 검사
        const emailResult = validateEmail(email);
        if (!emailResult.isValid) {
            if (emailResult.error) {
                addToast(emailResult.error, 'error');
            }
            return;
        }

        // 비밀번호는 입력만 되면 됨 (형식 검사 없음)
        if (!password || !password.trim()) {
            addToast('비밀번호를 입력해주세요.', 'error');
            return;
        }

        try {
            const response = await authService.login(email, password);
            // eslint-disable-next-line no-console
            console.log('로그인 응답:', response);
            addToast('로그인에 성공했습니다.', 'success');
            navigate('/');
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('에러: ', error);
        }
    };

    return {
        email,
        password,
        setEmail,
        setPassword,
        handleSubmit,
        navigate,
    };
};
