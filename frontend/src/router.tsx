import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/Auth/useAuth';
import { useAlarmSSE } from '@/hooks/notification/useNotificatonSSE';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useDelayedLoading } from '@/hooks/useDelayedLoading';

interface RouteProps {
    children: ReactNode;
}

// 보호된 라우트 (인증 필요)
export const ProtectedRoute = ({ children }: RouteProps) => {
    const { isAuthenticated, isLoading } = useAuth();
    const showSpinner = useDelayedLoading(isLoading);

    // 인증된 사용자만 SSE 연결
    useAlarmSSE();

    // 로딩 중일 때는 리다이렉트하지 않음 (인증 확인 대기)
    if (isLoading) {
        if (showSpinner) {
            return <LoadingSpinner fullScreen={true} size="lg" color="blue" />;
        }
        // 로딩 중이지만 스피너를 아직 표시하지 않을 때는 아무것도 렌더링하지 않음
        return null;
    }

    // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// 공개 라우트 (비로그인 접근 가능, 인증된 사용자는 메인으로 리다이렉트)
export const PublicRoute = ({ children }: RouteProps) => {
    // 공개 페이지에서는 새로운 유저 정보를 요청하지 않음 (기존 캐시만 활용)
    const { isAuthenticated } = useAuth({ enabled: false });

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};
