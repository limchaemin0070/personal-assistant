import { useMutation, useQueryClient } from '@tanstack/react-query';
import { alarmService } from '@/services/alarm.service';
import { useToastStore } from '../useToastStore';
import { queryKeys } from '@/lib/queryKeys';
import type { AlarmFormData } from '@/schemas/alarmSchema';
import { useMutationErrorHandler } from '../useMutationErrorHandler';

export const useCreateAlarm = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();
    const handleError = useMutationErrorHandler('create');

    return useMutation({
        mutationFn: (formData: AlarmFormData) =>
            alarmService.createAlarm(formData),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.alarms.all,
            });
            addToast('알람이 생성되었습니다.', 'success');
        },

        onError: handleError,
    });
};
