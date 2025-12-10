import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    reminderFormSchema,
    type ReminderFormData,
} from '@/schemas/reminderSchema';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import type { Reminder } from '@/types/reminder';

interface UseReminderFormOptions {
    initialReminder?: Reminder | null;
    initialDate?: Date;
    onSuccess?: (data: ReminderFormData) => void | Promise<void>;
}

export const useReminderForm = ({
    initialReminder,
    initialDate,
}: UseReminderFormOptions = {}) => {
    const defaultDate = initialDate || new Date();

    return useForm<ReminderFormData>({
        resolver: zodResolver(reminderFormSchema),
        defaultValues: {
            title: initialReminder?.title || '',
            memo: initialReminder?.memo || '',
            date: initialReminder?.date
                ? CalendarUtils.getDateKey(initialReminder.date)
                : CalendarUtils.getDateKey(defaultDate),
            time: initialReminder?.time || null,
            is_all_day: initialReminder?.isAllDay ?? true,
            notification_enabled: initialReminder?.notificationEnabled ?? false,
        },
        mode: 'onChange',
    });
};
