import React from 'react';
import type { Reminder } from '@/types';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import { useToggleReminderComplete } from '@/hooks/reminder/useToggleReminderComplete';
import { useDeleteReminder } from '@/hooks/reminder/useDeleteReminder';
import { Checkbox } from '../common/Checkbox';
import {
    reminderItemVariants,
    reminderTitleVariants,
    reminderTimeVariants,
} from './ReminderItem.style';
import { cn } from '@/utils/cn';
import { DeleteButton } from '../common/Button/DeleteButton';
import { UpdateButton } from '../common/Button/UpdateButton';

type ReminderItemProps = {
    reminder: Reminder;
    onEditReminder: (reminder: Reminder) => void;
};

export const ReminderItem: React.FC<ReminderItemProps> = ({
    reminder,
    onEditReminder,
}) => {
    const { title, time, isAllDay, isCompleted } = reminder;
    const displayTime = isAllDay ? '종일' : (time ?? '-');

    const updateReminder = useToggleReminderComplete();
    const deleteReminder = useDeleteReminder();

    const handleToggleComplete = (checked: boolean) => {
        updateReminder.mutateAsync({
            reminderId: reminder.id,
            isCompleted: checked,
        });
    };

    const handleEdit = () => {
        onEditReminder(reminder);
    };

    const handleDelete = () => {
        deleteReminder.mutateAsync(reminder.id);
    };

    const status = isCompleted ? 'completed' : 'incomplete';

    return (
        <div
            className={cn(
                reminderItemVariants({ status }),
                'flex flex-row justify-between gap-2',
            )}
        >
            <div className="flex flex-row gap-4 min-w-0 flex-1">
                <Checkbox
                    checked={isCompleted}
                    onCheckedChange={handleToggleComplete}
                    disabled={
                        updateReminder.isPending || deleteReminder.isPending
                    }
                />
                <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                    <span className={reminderTitleVariants({ status })}>
                        {title}
                    </span>
                    <span className={reminderTimeVariants({ status })}>
                        {CalendarUtils.formatTimeKorean(displayTime)}
                    </span>
                </div>
            </div>
            <div className="flex gap-2 shrink-0">
                <UpdateButton
                    onClick={handleEdit}
                    size="sm"
                    aria-label="일정 수정"
                    disabled={deleteReminder.isPending}
                />
                <DeleteButton
                    onClick={handleDelete}
                    size="sm"
                    aria-label="일정 삭제"
                    disabled={deleteReminder.isPending}
                />
            </div>
        </div>
    );
};
