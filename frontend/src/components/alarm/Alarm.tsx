import React, { useCallback, useState } from 'react';
import { AddButton } from '../common/Button/AddButton';
import { AlarmForm } from './AlarmForm';

// none : 기본 리스트 조회
type AlarmFormMode = 'none' | 'create' | 'edit';

export const Alarm: React.FC = () => {
    const [formMode, setFormMode] = useState<AlarmFormMode>('none');
    const [editingAlarmId, setEditingAlarmId] = useState<number | null>(null);

    // const { data: alarms = [] } = useAlarm();
    // const editingAlarm = alarms.find((r) => r.id === editingAlarmId);

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

    // const handleEditAlarm = useCallback((alarm: AlarmType): void => {
    //     setFormMode('edit');
    //     setEditingAlarmId(alarm.id);
    // }, []);

    // const handleToggle = (checked: boolean) => {
    //     // setFilterCompleted(checked);
    // };

    // const editingAlarm = alarms.find((r) => r.id === editingAlarmId);

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
                // editingAlarmId는 나중에 edit 모드에서 사용될 예정입니다
                // 현재는 주석 처리된 코드에서만 사용되므로 경고를 무시합니다
                return (
                    <AlarmForm
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        // initialAlarm={editingAlarm || null}
                        key={editingAlarmId ?? 'edit'}
                    />
                );
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
