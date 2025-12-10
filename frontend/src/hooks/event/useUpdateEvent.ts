import { useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarService } from '@/services/calendar.service';
import { useToastStore } from '../useToastStore';
import { queryKeys } from '@/lib/queryKeys';
import type { EventFormData } from '@/schemas/eventSchema';

export const useUpdateEvent = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();

    return useMutation({
        mutationFn: ({
            eventId,
            formData,
        }: {
            eventId: number;
            formData: EventFormData;
        }) => calendarService.updateSchedule(eventId, formData),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.events.user(),
            });
            addToast('일정이 수정되었습니다.', 'success');
        },

        onError: () => {
            addToast('일정 수정에 실패했습니다.', 'error');
        },
    });
};
