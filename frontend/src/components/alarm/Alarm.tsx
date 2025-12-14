import React, { useCallback, useState } from 'react';
import { AddButton } from '../common/Button/AddButton';
import { Toggle } from '../common/Toggle';
import { AlarmForm } from './AlarmForm';

// none : 기본 리스트 조회
type AlarmFormMode = 'none' | 'create' | 'edit';

export const Alarm: React.FC = () => {
    const [formMode, setFormMode] = useState<AlarmFormMode>('none');
    const [editingAlarmId, setEditingAlarmId] = useState<number | null>(null);

    // const { data: alarms = [] } = useAlarm();

    const handleAdd = useCallback((): void => {
        setFormMode((prevMode) => (prevMode === 'create' ? 'none' : 'create'));
        // setEditingReminderId(null);
    }, []);

    // const handleCancel = useCallback((): void => {
    //     setFormMode('none');
    //     // setEditingReminderId(null);
    // }, []);

    // const handleSubmit = useCallback((): void => {
    //     setFormMode('none');
    //     // setEditingReminderId(null);
    // }, []);

    // const handleEditReminder = useCallback((alarms: AlarmType): void => {
    //     setFormMode('edit');
    //     // setEditingReminderId(reminder.id);
    // }, []);

    // const handleToggle = (checked: boolean) => {
    //     // setFilterCompleted(checked);
    // };

    // const editingAlarm = alarms.find((r) => r.id === editingAlarmId);

    const renderFormSection = (): React.ReactElement | null => {
        switch (formMode) {
            case 'create':
                return <AlarmForm />;
            case 'edit':
                return <AlarmForm />;
            case 'none':
                return (
                    <div className="rounded-md text-sm text-gray-600">
                        {/* <AlarmList /> */}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-1 p-1">
            <div className="flex items-center gap-2 justify-between">
                <AddButton
                    onClick={handleAdd}
                    className=""
                    size="md"
                    isActive={formMode === 'create'}
                />
            </div>
            {renderFormSection()}
        </div>
    );
};
