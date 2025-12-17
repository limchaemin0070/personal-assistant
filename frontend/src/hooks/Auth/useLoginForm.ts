// hooks/Auth/useLoginForm.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginFormSchema, type LoginFormData } from '@/schemas/authSchema';
import { useLogin } from './useLogin';

export const useLoginForm = () => {
    const loginMutation = useLogin();

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onChange',
    });

    const handleSubmit = form.handleSubmit(async (data: LoginFormData) => {
        loginMutation.mutate({
            email: data.email,
            password: data.password,
        });
    });

    return {
        form,
        handleSubmit,
        isSubmitting: form.formState.isSubmitting || loginMutation.isPending,
    };
};
