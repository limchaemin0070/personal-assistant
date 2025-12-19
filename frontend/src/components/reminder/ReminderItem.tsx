import React from 'react';
import { BsBell } from 'react-icons/bs';
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

type ReminderItemProps = {
    reminder: Reminder;
    onEditReminder: (reminder: Reminder) => void;
};

export const ReminderItem: React.FC<ReminderItemProps> = ({
    reminder,
    onEditReminder,
}) => {
    const { title, time, isAllDay, isCompleted, notificationEnabled } =
        reminder;
    const displayTime = isAllDay ? '종일' : (time ?? '-');

    const updateReminder = useToggleReminderComplete();
    const deleteReminder = useDeleteReminder();

    const handleToggleComplete = (checked: boolean) => {
        updateReminder.mutateAsync({
            reminderId: reminder.id,
            isCompleted: checked,
        });
    };

    const handleItemClick = () => {
        onEditReminder(reminder);
    };

    const handleDelete = () => {
        deleteReminder.mutateAsync(reminder.id);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleItemClick();
        }
    };

    const status = isCompleted ? 'completed' : 'incomplete';

    return (
        <div
            className={cn(
                reminderItemVariants({ status }),
                'flex flex-row justify-between gap-2 cursor-pointer',
            )}
            onClick={handleItemClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
        >
            <div className="flex flex-row items-center gap-4 min-w-0 flex-1">
                <div
                    onClick={(e) => e.stopPropagation()}
                    role="presentation"
                    className="flex items-center"
                >
                    <Checkbox
                        checked={isCompleted}
                        onCheckedChange={handleToggleComplete}
                        disabled={
                            updateReminder.isPending || deleteReminder.isPending
                        }
                    />
                </div>
                <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                    <span className={reminderTitleVariants({ status })}>
                        {title}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <span className={reminderTimeVariants({ status })}>
                            {CalendarUtils.formatTimeKorean(displayTime)}
                        </span>
                        {notificationEnabled && (
                            <BsBell
                                className={cn(
                                    'w-3 h-3 shrink-0',
                                    status === 'completed'
                                        ? 'text-gray-400'
                                        : 'text-gray-500',
                                )}
                                aria-label="알람 설정됨"
                            />
                        )}
                    </div>
                </div>
            </div>
            <div
                className="flex gap-2 shrink-0"
                onClick={(e) => e.stopPropagation()}
                role="presentation"
            >
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
