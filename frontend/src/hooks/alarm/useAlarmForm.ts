import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { alarmFormSchema, type AlarmFormData } from '@/schemas/alarmSchema';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import type { Alarm } from '@/types/alarm';

interface UseAlarmFormOptions {
    initialAlarm?: Alarm | null;
    initialDate?: Date;
    onSuccess?: (data: AlarmFormData) => void | Promise<void>;
}

export const useAlarmForm = ({
    initialAlarm,
    initialDate,
}: UseAlarmFormOptions = {}) => {
    const defaultDate = initialDate || new Date();

    return useForm({
        resolver: zodResolver(alarmFormSchema),
        defaultValues: {
            title: initialAlarm?.title || '',
            time: initialAlarm?.time || '',
            date: initialAlarm?.date
                ? CalendarUtils.getDateKey(initialAlarm.date)
                : CalendarUtils.getDateKey(defaultDate),
            repeat_days: initialAlarm?.repeat_days ?? [],
        },
        mode: 'onChange',
    });
};
