import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reminderService } from '@/services/reminder.service';
import { queryKeys } from '@/lib/queryKeys';
import { useMutationErrorHandler } from '../useMutationErrorHandler';

export const useToggleReminderComplete = () => {
    const queryClient = useQueryClient();
    const handleError = useMutationErrorHandler('toggle');

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
                queryKey: queryKeys.reminders.all,
            });
        },

        onError: handleError,
    });
};
