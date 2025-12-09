import React from 'react';
import { Calendar } from './Calendar';

interface CalendarMainProps {
    // eslint-disable-next-line react/require-default-props
    onToggleLeftSidebar?: () => void;
    // eslint-disable-next-line react/require-default-props
    onToggleRightSidebar?: () => void;
}

export const CalendarMain: React.FC<CalendarMainProps> = ({
    onToggleLeftSidebar,
    onToggleRightSidebar,
}) => {
    return (
        <main className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between bg-white px-4 py-3">
                <div className="flex items-center gap-2">
                    {onToggleLeftSidebar && (
                        <button
                            type="button"
                            onClick={onToggleLeftSidebar}
                            className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
                        >
                            ☰
                        </button>
                    )}
                </div>
                {onToggleRightSidebar && (
                    <button
                        type="button"
                        onClick={onToggleRightSidebar}
                        className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
                    >
                        알람/리마인더
                    </button>
                )}
            </div>
            <div className="flex flex-1">
                <Calendar />
            </div>
        </main>
    );
};
