import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/Auth/useAuth';
import { useAlarmSSE } from '@/hooks/notification/useNotificationSSE';
import { Loading } from '@/components/common/Loading';
import { useDelayedLoading } from '@/hooks/useDelayedLoading';

interface RouteProps {
    children: ReactNode;
}

// 보호된 라우트 (인증 필요)
export const ProtectedRoute = ({ children }: RouteProps) => {
    const { isAuthenticated, isLoading } = useAuth();
    const showSpinner = useDelayedLoading(isLoading);
    const location = useLocation();

    useAlarmSSE();

    if (isLoading) {
        if (showSpinner) {
            return <Loading fullScreen size="lg" color="blue" />;
        }
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export const PublicRoute = ({ children }: RouteProps) => {
    const { isAuthenticated } = useAuth({ enabled: false });

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};
