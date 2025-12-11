import React from 'react';
import type { Reminder } from '@/types';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import { useToggleReminderComplete } from '@/hooks/reminder/useToggleReminderComplete';
import { Checkbox } from '../common/Checkbox';
import {
    reminderItemVariants,
    reminderTitleVariants,
    reminderTimeVariants,
} from './ReminderItem.style';

type ReminderItemProps = {
    reminder: Reminder;
};

export const ReminderItem: React.FC<ReminderItemProps> = ({ reminder }) => {
    const { title, time, isAllDay, isCompleted } = reminder;
    const displayTime = isAllDay ? '종일' : (time ?? '-');

    const updateReminder = useToggleReminderComplete();

    const handleToggleComplete = (checked: boolean) => {
        updateReminder.mutateAsync({
            reminderId: reminder.id,
            isCompleted: checked,
        });
    };

    const status = isCompleted ? 'completed' : 'incomplete';

    return (
        <div className={reminderItemVariants({ status })}>
            <div className="flex flex-col">
                <span className={reminderTitleVariants({ status })}>
                    {title}
                </span>
                <span className={reminderTimeVariants({ status })}>
                    {CalendarUtils.formatTimeKorean(displayTime)}
                </span>
            </div>
            <Checkbox
                checked={isCompleted}
                onCheckedChange={handleToggleComplete}
                disabled={updateReminder.isPending}
            />
        </div>
    );
};
