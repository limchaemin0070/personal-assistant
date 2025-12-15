import { useQuery } from '@tanstack/react-query';
import { alarmService } from '@/services/alarm.service';
import type { Alarm } from '@/types/alarm';
import { queryKeys } from '@/lib/queryKeys';

export const useAlarm = () => {
    return useQuery<Alarm[]>({
        queryKey: queryKeys.alarms.user(),
        queryFn: async () => {
            const alarms = await alarmService.getAlarmsByUserId();
            return alarms.sort((a, b) => {
                // 1. 반복 알람을 먼저 (is_repeat === true)
                if (a.is_repeat && !b.is_repeat) return -1;
                if (!a.is_repeat && b.is_repeat) return 1;

                // 2. 반복 알람끼리는 시간순으로 정렬 (빠른 시간이 위로)
                if (a.is_repeat && b.is_repeat) {
                    return a.time.localeCompare(b.time);
                }

                // 3. 날짜 지정 알람끼리는 날짜순으로 정렬 (빠른 날짜가 위로)
                if (!a.is_repeat && !b.is_repeat) {
                    // 날짜가 없는 항목은 맨 아래로
                    if (!a.date && !b.date) return 0;
                    if (!a.date) return 1;
                    if (!b.date) return -1;

                    const dateA = new Date(a.date).getTime();
                    const dateB = new Date(b.date).getTime();

                    // 날짜가 같으면 시간순으로 정렬
                    if (dateA === dateB) {
                        return a.time.localeCompare(b.time);
                    }

                    return dateA - dateB;
                }

                return 0;
            });
        },
        staleTime: 5 * 60 * 1000,
    });
};
