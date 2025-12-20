import { useQuery } from '@tanstack/react-query';
import { reminderService } from '@/services/reminder.service';
import type { Reminder } from '@/types';
import { queryKeys } from '@/lib/queryKeys';
import { sortRemindersByDeadline } from '@/utils/sorting';

export type ReminderFilter = 'all' | 'active' | 'completed';

export const useReminder = (filter: ReminderFilter = 'all') => {
    const getQueryKey = () => {
        switch (filter) {
            case 'active':
                return queryKeys.reminders.active();
            case 'completed':
                return queryKeys.reminders.completed();
            default:
                return queryKeys.reminders.user();
        }
    };

    return useQuery<Reminder[]>({
        queryKey: getQueryKey(),
        queryFn: async () => {
            // 전체 조회 + 프론트 필터링
            const reminders = await reminderService.getRemindersByUserId();
            let filtered = reminders;

            if (filter === 'active') {
                filtered = reminders.filter((r) => !r.isCompleted);
            } else if (filter === 'completed') {
                filtered = reminders.filter((r) => r.isCompleted);
            }
            // TODO: 카테고리 필터 추가 시 (현재는 프론트에서 처리하고 있기 때문에)
            // if (category) {
            //   filtered = filtered.filter(r => r.category === category);
            // }

            return sortRemindersByDeadline(filtered);

            // 마이그레이션 시...
            // 추후 리마인더 데이터가 쌓일 경우 백엔드에서 쿼리파라미터로 필터링
            // GET /reminders?filter=active&category=work&sort=deadline
            // const reminders = await reminderService.getRemindersByFilter(filter);
            // return sortRemindersByDeadline(reminders);
        },
        staleTime: 0,
    });
};
