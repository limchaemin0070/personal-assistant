import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { CalendarLayout } from '@/components/layout/MainLayout';
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar';
import { RightSidebar } from '@/components/layout/RightSidebar';

export const MainPage = () => {
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

    const toggleLeftSidebar = () => {
        setIsLeftSidebarOpen((prev) => !prev);
    };

    const toggleRightSidebar = () => {
        setIsRightSidebarOpen((prev) => !prev);
    };

    return (
        <CalendarLayout>
            {isLeftSidebarOpen && (
                <CalendarSidebar onClose={() => setIsLeftSidebarOpen(false)} />
            )}
            <Outlet
                context={{
                    isLeftSidebarOpen,
                    isRightSidebarOpen,
                    toggleLeftSidebar,
                    toggleRightSidebar,
                }}
            />
            {isRightSidebarOpen && (
                <RightSidebar onClose={() => setIsRightSidebarOpen(false)} />
            )}
        </CalendarLayout>
    );
};
