import { useMutation, useQueryClient } from '@tanstack/react-query';
import { alarmService } from '@/services/alarm.service';
import { useToastStore } from '../useToastStore';
import { queryKeys } from '@/lib/queryKeys';

export const useDeleteAlarm = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();

    return useMutation({
        mutationFn: (alarmId: number) => alarmService.deleteAlarm(alarmId),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.alarms.user(),
            });
            addToast('알람이 삭제되었습니다.', 'success');
        },

        onError: () => {
            addToast('알람 삭제에 실패했습니다.', 'error');
        },
    });
};
