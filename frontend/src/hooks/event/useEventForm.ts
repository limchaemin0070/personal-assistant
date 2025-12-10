import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventFormSchema, type EventFormData } from '@/schemas/eventSchema';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import type { CalendarEvent } from '@/types/calendar';

interface UseEventFormOptions {
    initialEvent?: CalendarEvent | null;
    initialDate?: Date;
    onSuccess?: (data: EventFormData) => void | Promise<void>;
}

export const useEventForm = ({
    initialEvent,
    initialDate,
}: UseEventFormOptions = {}) => {
    const defaultDate = initialDate || new Date();
    const defaultStartTime = '09:00';
    const defaultEndTime = '10:00';

    return useForm<EventFormData>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            title: initialEvent?.title || '',
            memo: initialEvent?.memo || '',
            start_date: initialEvent
                ? CalendarUtils.getDateKey(initialEvent.startDate)
                : CalendarUtils.getDateKey(defaultDate),
            end_date: initialEvent
                ? CalendarUtils.getDateKey(initialEvent.endDate)
                : CalendarUtils.getDateKey(defaultDate),
            is_all_day: initialEvent?.isAllDay ?? true,
            start_time: initialEvent?.startTime || defaultStartTime,
            end_time: initialEvent?.endTime || defaultEndTime,
            notification_enabled: initialEvent?.notificationEnabled ?? false,
        },
        mode: 'onChange',
    });
};
