import { createBrowserRouter } from 'react-router-dom';
import { RegisterPage, LoginPage, MainPage } from './pages';
import { ProtectedRoute, PublicRoute } from './router';

export const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <MainPage />
            </ProtectedRoute>
        ),
    },
    {
        path: '/login',
        element: (
            <PublicRoute>
                <LoginPage />
            </PublicRoute>
        ),
    },
    {
        path: '/register',
        element: (
            <PublicRoute>
                <RegisterPage />
            </PublicRoute>
        ),
    },
]);
