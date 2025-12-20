import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';

// /calendar 접근 시 오늘 날짜로 리다이렉트하는 컴포넌트
export const CalendarRedirect = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return <Navigate to={`/calendar/month/${today}`} replace />;
};
