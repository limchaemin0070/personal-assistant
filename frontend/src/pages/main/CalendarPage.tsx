import { useOutletContext } from 'react-router-dom';
import { CalendarMain } from '@/components/calendar/CalendarMain';

interface MainPageContext {
    isLeftSidebarOpen: boolean;
    isRightSidebarOpen: boolean;
    toggleLeftSidebar: () => void;
    toggleRightSidebar: () => void;
}

export const CalendarPage = () => {
    const { toggleLeftSidebar, toggleRightSidebar } =
        useOutletContext<MainPageContext>();

    return (
        <CalendarMain
            onToggleLeftSidebar={toggleLeftSidebar}
            onToggleRightSidebar={toggleRightSidebar}
        />
    );
};

