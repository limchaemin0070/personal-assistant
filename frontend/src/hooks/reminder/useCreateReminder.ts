import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reminderService } from '@/services/reminder.service';
import { useToastStore } from '../useToastStore';
import { queryKeys } from '@/lib/queryKeys';
import type { ReminderFormData } from '@/schemas/reminderSchema';

export const useCreateReminder = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();

    return useMutation({
        mutationFn: (formData: ReminderFormData) =>
            reminderService.createReminder(formData),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.reminders.user(),
            });
            addToast('리마인더가 생성되었습니다.', 'success');
        },

        onError: () => {
            addToast('리마인더 생성에 실패했습니다.', 'error');
        },
    });
};
