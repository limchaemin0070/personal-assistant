import React from 'react';
import { Sidebar } from '@/components/common/Sidebar';

interface CalendarSidebarProps {
    // eslint-disable-next-line react/require-default-props
    onClose?: () => void;
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
    onClose,
}) => {
    return (
        <Sidebar
            title="캘린더"
            width="md"
            borderPosition="right"
            onClose={onClose}
        >
            <div className="space-y-2">
                <div className="rounded-md bg-gray-100 p-3 text-sm text-gray-700">
                    캘린더 목록
                </div>
                <div className="rounded-md bg-gray-100 p-3 text-sm text-gray-700">
                    필터 옵션
                </div>
            </div>
        </Sidebar>
    );
};
