import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { router } from '@/router.config';
import ToastContainer from './components/common/Toast/ToastContainer';
import { useAlarmSSE } from './hooks/notification/useNotificatonSSE';

// QueryClient 설정 - 전역 설정으로 한 번만 생성
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // 네트워크 에러 시 재시도 설정
            retry: (failureCount, error) => {
                const axiosError = error as { response?: { status?: number } };
                // 401 에러는 재시도하지 않음
                if (axiosError?.response?.status === 401) {
                    return false;
                }
                // 다른 에러는 최대 1번 재시도
                return failureCount < 1;
            },
            // 기본 staleTime (선택사항)
            staleTime: 0,
        },
    },
});

export const App = () => {
    useAlarmSSE();
    return (
        <QueryClientProvider client={queryClient}>
            <ToastContainer />
            <RouterProvider router={router} />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
};
