// hooks/useLogout.ts
import { useQueryClient } from '@tanstack/react-query';
import { setLoggingOut } from '@/utils/apiState';
import { authService } from '@/services/auth.service';

export const useLogout = () => {
    const queryClient = useQueryClient();

    const logout = async () => {
        try {
            setLoggingOut(true);
            queryClient.cancelQueries();
            queryClient.clear();
            await authService.logout();
        } catch (error) {
            console.error('로그아웃 중 오류:', error);
        } finally {
            setLoggingOut(false);
            window.location.replace('/login');
        }
    };

    return { logout };
};
