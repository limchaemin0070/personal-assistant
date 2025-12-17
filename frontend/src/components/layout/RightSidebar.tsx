import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Reminder } from '@/components/reminder/Reminder';
import { Alarm } from '../alarm/Alarm';

type RightSidebarTab = 'alarm' | 'reminder';

interface RightSidebarProps {
    // eslint-disable-next-line react/require-default-props
    onClose?: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<RightSidebarTab>('reminder');

    return (
        <Sidebar
            title=""
            width="lg"
            borderPosition="left"
            onClose={onClose}
            showCloseButton={false}
            headerActions={
                <div className="flex gap-1 rounded-md bg-gray-100 p-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('reminder')}
                        className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                            activeTab === 'reminder'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        리마인더
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('alarm')}
                        className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                            activeTab === 'alarm'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        알람
                    </button>
                </div>
            }
        >
            {activeTab === 'alarm' ? <Alarm /> : <Reminder />}
        </Sidebar>
    );
};
