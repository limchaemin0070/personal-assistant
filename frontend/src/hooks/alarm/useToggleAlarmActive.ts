import { useMutation, useQueryClient } from '@tanstack/react-query';
import { alarmService } from '@/services/alarm.service';
import { useToastStore } from '../useToastStore';
import { queryKeys } from '@/lib/queryKeys';

export const useToggleAlarmActive = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();

    return useMutation({
        mutationFn: ({
            alarmId,
            isActive,
        }: {
            alarmId: number;
            isActive: boolean;
        }) => alarmService.toggleActive(alarmId, isActive),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.alarms.all,
            });
        },

        onError: () => {
            addToast('상태 변경에 실패했습니다.', 'error');
        },
    });
};
