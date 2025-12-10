import { useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarService } from '@/services/calendar.service';
import { useToastStore } from '../useToastStore';
import { queryKeys } from '@/lib/queryKeys';
import type { EventFormData } from '@/schemas/eventSchema';

export const useCreateEvent = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();

    return useMutation({
        mutationFn: (formData: EventFormData) =>
            calendarService.createSchedule(formData),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.events.user(),
            });
            addToast('일정이 생성되었습니다.', 'success');
        },

        onError: () => {
            addToast('일정 생성에 실패했습니다.', 'error');
        },
    });
};
