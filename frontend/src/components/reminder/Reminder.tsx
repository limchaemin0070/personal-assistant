import React, { useCallback, useState } from 'react';
import { AddButton } from '../common/Button/AddButton';
import { ReminderForm } from './ReminderForm';
import { ReminderList } from './ReminderList';
import type { Reminder as ReminderType } from '@/types';
import { useReminder } from '@/hooks/reminder/useReminder';
import { Toggle } from '../common/Toggle';

// none : 기본 리스트 조회
type ReminderFormMode = 'none' | 'create' | 'edit';

export const Reminder: React.FC = () => {
    const [formMode, setFormMode] = useState<ReminderFormMode>('none');
    const [editingReminderId, setEditingReminderId] = useState<number | null>(
        null,
    );
    const [filterCompleted, setFilterCompleted] = useState<boolean>(false);
    const { data: reminders = [] } = useReminder();

    const handleAdd = useCallback((): void => {
        setFormMode((prevMode) => (prevMode === 'create' ? 'none' : 'create'));
        setEditingReminderId(null);
    }, []);

    const handleCancel = useCallback((): void => {
        setFormMode('none');
        setEditingReminderId(null);
    }, []);

    const handleSubmit = useCallback((): void => {
        setFormMode('none');
        setEditingReminderId(null);
    }, []);

    const handleEditReminder = useCallback((reminder: ReminderType): void => {
        setFormMode('edit');
        setEditingReminderId(reminder.id);
    }, []);

    const handleToggle = (checked: boolean) => {
        setFilterCompleted(checked);
    };

    const editingReminder = reminders.find((r) => r.id === editingReminderId);

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
                        initialReminder={editingReminder || null}
                    />
                );
            case 'none':
                return (
                    <div className="rounded-md text-sm text-gray-600">
                        <ReminderList
                            onEditReminder={handleEditReminder}
                            filterCompleted={filterCompleted}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-1 p-1 ">
            <div className="sticky top-0 z-10 bg-stone-100 py-1 flex items-center gap-2 justify-between">
                <AddButton
                    onClick={handleAdd}
                    className=""
                    size="md"
                    isActive={formMode === 'create'}
                />
                <Toggle
                    label="완료된 항목"
                    size="sm"
                    labelPosition="left"
                    checked={filterCompleted}
                    onCheckedChange={handleToggle}
                />
            </div>
            {renderFormSection()}
        </div>
    );
};
