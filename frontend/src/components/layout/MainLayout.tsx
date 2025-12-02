import React from 'react';

interface CalendarLayoutProps {
    children: React.ReactNode;
}

export const CalendarLayout: React.FC<CalendarLayoutProps> = ({ children }) => {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-gray-50">
            {children}
        </div>
    );
};

export const MainLayout = () => {};
