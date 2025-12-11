import { useQuery } from '@tanstack/react-query';
import { reminderService } from '@/services/reminder.service';
import type { Reminder } from '@/types';
import { queryKeys } from '@/lib/queryKeys';

export const useReminder = () => {
    return useQuery<Reminder[]>({
        queryKey: queryKeys.reminders.user(),
        queryFn: async () => {
            const reminders = await reminderService.getRemindersByUserId();
            return reminders.sort((a, b) => {
                // 날짜가 없는 항목은 맨 아래로 보낸다.
                if (!a.date && !b.date) return 0;
                if (!a.date) return 1;
                if (!b.date) return -1;

                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();

                // 가장 미래(큰 값)부터 정렬
                if (dateA !== dateB) return dateB - dateA;

                // 같은 날짜: 시간 미지정(또는 종일)이 먼저
                const aHasTime = !!(a.time && !a.isAllDay);
                const bHasTime = !!(b.time && !b.isAllDay);
                if (aHasTime && !bHasTime) return 1;
                if (!aHasTime && bHasTime) return -1;

                // 둘 다 시간이 있을 경우 시간 내림차순
                if (aHasTime && bHasTime) {
                    return b.time!.localeCompare(a.time!);
                }

                return 0;
            });
        },
        staleTime: 5 * 60 * 1000,
    });
};
