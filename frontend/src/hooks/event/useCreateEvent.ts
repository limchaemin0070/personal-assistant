import { useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarService } from '@/services/calendar.service';
import { useToastStore } from '../useToastStore';
import { queryKeys } from '@/lib/queryKeys';
import type { EventFormData } from '@/schemas/eventSchema';
import { useMutationErrorHandler } from '../useMutationErrorHandler';

export const useCreateEvent = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();
    const handleError = useMutationErrorHandler('create');

    return useMutation({
        mutationFn: (formData: EventFormData) =>
            calendarService.createSchedule(formData),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.events.user(),
            });
            addToast('일정이 생성되었습니다.', 'success');
        },

        onError: handleError,
    });
};
