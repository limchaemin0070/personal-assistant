import React, { useState } from 'react';
import { Sidebar } from '../common/Sidebar';
import { Reminder } from '@/components/reminder/Reminder';
import { Alarm } from '../alarm/Alarm';
import { ButtonGroup } from '../common/ButtonGroup';

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
                <ButtonGroup
                    options={[
                        { value: 'reminder', label: '리마인더' },
                        { value: 'alarm', label: '알람' },
                    ]}
                    value={activeTab}
                    onChange={(value) => setActiveTab(value as RightSidebarTab)}
                    className="rounded-md bg-gray-100 p-1"
                />
            }
        >
            {activeTab === 'alarm' ? <Alarm /> : <Reminder />}
        </Sidebar>
    );
};
