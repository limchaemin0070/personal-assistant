import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '../useToastStore';
import { calendarService } from '@/services/calendar.service';
import { queryKeys } from '@/lib/queryKeys';

export const useDeleteEvent = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();

    return useMutation({
        mutationFn: (eventId: number) =>
            calendarService.deleteSchedule(eventId),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.events.user(),
            });
            addToast('일정이 삭제되었습니다.', 'success');
        },

        onError: () => {
            addToast('일정 삭제에 실패했습니다.', 'error');
        },
    });
};
