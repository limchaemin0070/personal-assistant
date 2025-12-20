import { useMutation, useQueryClient } from '@tanstack/react-query';
import { alarmService } from '@/services/alarm.service';
import { useToastStore } from '../useToastStore';
import { queryKeys } from '@/lib/queryKeys';
import type { AlarmFormData } from '@/schemas/alarmSchema';
import { useMutationErrorHandler } from '../useMutationErrorHandler';

export const useUpdateAlarm = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();
    const handleError = useMutationErrorHandler('update');

    return useMutation({
        mutationFn: ({
            alarmId,
            formData,
        }: {
            alarmId: number;
            formData: AlarmFormData;
        }) => alarmService.updateAlarm(alarmId, formData),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.alarms.all,
            });
            addToast('알람이 수정되었습니다.', 'success');
        },

        onError: handleError,
    });
};
