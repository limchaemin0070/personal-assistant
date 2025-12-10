import React, { useCallback, useState } from 'react';
import { AddButton } from '../common/Button/AddButton';
import { ReminderForm } from './ReminderForm';

// none : 기본 리스트 조회
type ReminderFormMode = 'none' | 'create' | 'edit';

export const Reminder: React.FC = () => {
    const [formMode, setFormMode] = useState<ReminderFormMode>('none');
    const [editingReminderId, setEditingReminderId] = useState<number | null>(
        null,
    );

    const handleAdd = useCallback((): void => {
        setFormMode((prevMode) => (prevMode === 'create' ? 'none' : 'create'));
    }, []);

    const handleCancel = useCallback((): void => {
        setFormMode('none');
        setEditingReminderId(null);
    }, []);

    const handleSubmit = useCallback((): void => {
        setFormMode('none');
        setEditingReminderId(null);
    }, []);

    const renderFormSection = (): React.ReactElement | null => {
        switch (formMode) {
            case 'create':
                return (
                    <ReminderForm
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                );
            case 'edit':
                return (
                    <ReminderForm
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        initialReminder={null}
                    />
                );
            case 'none':
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            <AddButton
                onClick={handleAdd}
                className=""
                size="md"
                isActive={formMode === 'create'}
            />
            {renderFormSection()}
            <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                리마인더 목록이 여기에 표시됩니다
            </div>
        </div>
    );
};
