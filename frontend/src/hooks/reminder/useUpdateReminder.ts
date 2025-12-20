import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reminderService } from '@/services/reminder.service';
import { useToastStore } from '../useToastStore';
import { queryKeys } from '@/lib/queryKeys';
import type { ReminderFormData } from '@/schemas/reminderSchema';
import { useMutationErrorHandler } from '../useMutationErrorHandler';

export const useUpdateReminder = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();
    const handleError = useMutationErrorHandler('update');

    return useMutation({
        mutationFn: ({
            reminderId,
            formData,
        }: {
            reminderId: number;
            formData: ReminderFormData;
        }) => reminderService.updateReminder(reminderId, formData),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.reminders.all,
            });
            addToast('리마인더가 수정되었습니다.', 'success');
        },

        onError: handleError,
    });
};
