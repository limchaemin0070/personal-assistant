import { useMutation, useQueryClient } from '@tanstack/react-query';
import { alarmService } from '@/services/alarm.service';
import { useToastStore } from '../useToastStore';
import { queryKeys } from '@/lib/queryKeys';
import { useMutationErrorHandler } from '../useMutationErrorHandler';

export const useDeleteAlarm = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();
    const handleError = useMutationErrorHandler('delete');

    return useMutation({
        mutationFn: (alarmId: number) => alarmService.deleteAlarm(alarmId),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.alarms.all,
            });
            addToast('알람이 삭제되었습니다.', 'success');
        },

        onError: handleError,
    });
};
