import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/Auth/useAuth';
import { useAlarmSSE } from '@/hooks/notification/useNotificatonSSE';

interface RouteProps {
    children: ReactNode;
}

// 보호된 라우트 (인증 필요)
export const ProtectedRoute = ({ children }: RouteProps) => {
    const { isAuthenticated } = useAuth();

    // 인증된 사용자만 SSE 연결
    useAlarmSSE();

    // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// 공개 라우트 (비로그인 접근 가능, 인증된 사용자는 메인으로 리다이렉트)
export const PublicRoute = ({ children }: RouteProps) => {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};
