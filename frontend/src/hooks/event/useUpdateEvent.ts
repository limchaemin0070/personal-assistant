import { useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarService } from '@/services/calendar.service';
import { useToastStore } from '../useToastStore';
import { queryKeys } from '@/lib/queryKeys';
import type { EventFormData } from '@/schemas/eventSchema';
import { useMutationErrorHandler } from '../useMutationErrorHandler';

export const useUpdateEvent = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();
    const handleError = useMutationErrorHandler('update');

    return useMutation({
        mutationFn: ({
            eventId,
            formData,
        }: {
            eventId: number;
            formData: EventFormData;
        }) => calendarService.updateSchedule(eventId, formData),

        onSuccess: () => {
            // 모든 events 관련 쿼리 무효화 (range 기반 쿼리 포함)
            queryClient.invalidateQueries({
                queryKey: queryKeys.events.all,
            });
            addToast('일정이 수정되었습니다.', 'success');
        },

        onError: handleError,
    });
};
