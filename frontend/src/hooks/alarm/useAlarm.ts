import { useQuery } from '@tanstack/react-query';
import { alarmService } from '@/services/alarm.service';
import type { Alarm } from '@/types/alarm';
import { queryKeys } from '@/lib/queryKeys';
import { sortAlarmsByPriority } from '@/utils/sorting';

export const useAlarm = () => {
    return useQuery<Alarm[]>({
        queryKey: queryKeys.alarms.user(),
        queryFn: async () => {
            const alarms = await alarmService.getAlarmsByUserId();
            return sortAlarmsByPriority(alarms);
        },
        staleTime: 0,
    });
};
