import { useMutation, useQueryClient } from '@tanstack/react-query';
import { alarmService } from '@/services/alarm.service';
import { useToastStore } from '../useToastStore';
import { queryKeys } from '@/lib/queryKeys';
import type { AlarmFormData } from '@/schemas/alarmSchema';

export const useUpdateAlarm = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();

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
                queryKey: queryKeys.alarms.user(),
            });
            addToast('알람이 수정되었습니다.', 'success');
        },

        onError: () => {
            addToast('알람 수정에 실패했습니다.', 'error');
        },
    });
};
