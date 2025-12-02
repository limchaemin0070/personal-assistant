import { useState } from 'react';
import { CalendarLayout } from '@/components/layout/MainLayout';
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar';
import { CalendarMain } from '@/components/calendar/CalendarMain';
import { RightSidebar } from '@/components/layout/RightSidebar';

export const MainPage = () => {
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
    return (
        <CalendarLayout>
            {isLeftSidebarOpen && (
                <CalendarSidebar onClose={() => setIsLeftSidebarOpen(false)} />
            )}
            <CalendarMain
                onToggleLeftSidebar={() =>
                    setIsLeftSidebarOpen(!isLeftSidebarOpen)
                }
                onToggleRightSidebar={() =>
                    setIsRightSidebarOpen(!isRightSidebarOpen)
                }
            />
            {isRightSidebarOpen && (
                <RightSidebar onClose={() => setIsRightSidebarOpen(false)} />
            )}
        </CalendarLayout>
    );
};
