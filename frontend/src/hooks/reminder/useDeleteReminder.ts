import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reminderService } from '@/services/reminder.service';
import { useToastStore } from '../useToastStore';
import { queryKeys } from '@/lib/queryKeys';

export const useDeleteReminder = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();

    return useMutation({
        mutationFn: (reminderId: number) =>
            reminderService.deleteReminder(reminderId),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.reminders.all,
            });
            addToast('리마인더가 삭제되었습니다.', 'success');
        },

        onError: () => {
            addToast('리마인더 삭제에 실패했습니다.', 'error');
        },
    });
};
