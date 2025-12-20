import { useMutation, useQueryClient } from '@tanstack/react-query';
import { alarmService } from '@/services/alarm.service';
import { queryKeys } from '@/lib/queryKeys';
import { useMutationErrorHandler } from '../useMutationErrorHandler';

export const useToggleAlarmActive = () => {
    const queryClient = useQueryClient();
    const handleError = useMutationErrorHandler('toggle');

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

        onError: handleError,
    });
};
