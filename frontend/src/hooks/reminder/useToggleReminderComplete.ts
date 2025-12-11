import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reminderService } from '@/services/reminder.service';
import { useToastStore } from '../useToastStore';
import { queryKeys } from '@/lib/queryKeys';

export const useToggleReminderComplete = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();

    return useMutation({
        mutationFn: ({
            reminderId,
            isCompleted,
        }: {
            reminderId: number;
            isCompleted: boolean;
        }) => reminderService.toggleComplete(reminderId, isCompleted),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.reminders.user(),
            });
        },

        onError: () => {
            addToast('상태 변경에 실패했습니다.', 'error');
        },
    });
};
