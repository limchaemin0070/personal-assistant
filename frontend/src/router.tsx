import { createBrowserRouter, Navigate } from 'react-router-dom';

import { RegisterPage } from './pages';

export const router = createBrowserRouter([
    // 임시로 루트를 register로 리다이렉트 (추후 로그인으로 수정필요함)
    {
        path: '/',
        element: <Navigate to="/register" replace />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
]);
