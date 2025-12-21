import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '../useToastStore';
import { calendarService } from '@/services/calendar.service';
import { queryKeys } from '@/lib/queryKeys';
import { useMutationErrorHandler } from '../useMutationErrorHandler';

export const useDeleteEvent = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();
    const handleError = useMutationErrorHandler('delete');

    return useMutation({
        mutationFn: (eventId: number) =>
            calendarService.deleteSchedule(eventId),

        onSuccess: () => {
            // 모든 events 관련 쿼리 무효화 (range 기반 쿼리 포함)
            queryClient.invalidateQueries({
                queryKey: queryKeys.events.all,
            });
            addToast('일정이 삭제되었습니다.', 'success');
        },

        onError: handleError,
    });
};
