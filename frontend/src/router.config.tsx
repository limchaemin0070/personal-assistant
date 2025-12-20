import { createBrowserRouter } from 'react-router-dom';
import {
    RegisterPage,
    LoginPage,
    MainPage,
    CalendarPage,
    CalendarRedirect,
} from './pages';
import { ProtectedRoute, PublicRoute } from './router';

export const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <MainPage />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <CalendarRedirect />,
            },
            {
                path: 'calendar',
                element: <CalendarRedirect />,
            },
            {
                path: 'calendar/:view/:date',
                element: <CalendarPage />,
            },
        ],
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
