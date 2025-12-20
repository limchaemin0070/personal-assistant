import React, { useCallback, useState } from 'react';
import { AddButton } from '../common/Button/AddButton';
import { AlarmForm } from './AlarmForm';
import { AlarmList } from './AlarmList';
import type { Alarm as AlarmType } from '@/types/alarm';
import { useAlarm } from '@/hooks/alarm/useAlarm';

// none : 기본 리스트 조회
type AlarmFormMode = 'none' | 'create' | 'edit';

export const Alarm: React.FC = () => {
    const [formMode, setFormMode] = useState<AlarmFormMode>('none');
    const [editingAlarmId, setEditingAlarmId] = useState<number | null>(null);

    const { data: alarms = [] } = useAlarm();
    const editingAlarm = alarms.find((r) => r.id === editingAlarmId);

    const handleAdd = useCallback((): void => {
        setFormMode((prevMode) => (prevMode === 'create' ? 'none' : 'create'));
        setEditingAlarmId(null);
    }, []);

    const handleCancel = useCallback((): void => {
        setFormMode('none');
        setEditingAlarmId(null);
    }, []);

    const handleSubmit = useCallback((): void => {
        setFormMode('none');
        setEditingAlarmId(null);
    }, []);

    const handleEditAlarm = useCallback((alarm: AlarmType): void => {
        setFormMode('edit');
        setEditingAlarmId(alarm.id);
    }, []);

    const renderFormSection = (): React.ReactElement | null => {
        switch (formMode) {
            case 'create':
                return (
                    <AlarmForm
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                );
            case 'edit':
                return (
                    <AlarmForm
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        initialAlarm={editingAlarm || null}
                        key={editingAlarmId ?? 'edit'}
                    />
                );
            case 'none':
                return (
                    <div className="rounded-md text-sm text-gray-600">
                        <AlarmList onEditAlarm={handleEditAlarm} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-1 p-1">
            <div className="flex items-center gap-2 justify-between sticky top-0 sidebar-bg-right py-1 -mx-1 px-1 z-10">
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
