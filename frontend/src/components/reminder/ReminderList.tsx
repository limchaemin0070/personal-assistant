import { useMemo } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Reminder } from '@/types';
import { ReminderItem } from './ReminderItem';
import { useReminder } from '@/hooks/reminder/useReminder';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import { Loading } from '../common/Loading';
import { useDelayedLoading } from '@/hooks/useDelayedLoading';

interface ReminderListProps {
    filterCompleted: boolean;
    onEditReminder: (reminder: Reminder) => void;
}

export const ReminderList = ({
    onEditReminder,
    filterCompleted,
}: ReminderListProps) => {
    const { data: reminders = [], isLoading } = useReminder();
    const showSpinner = useDelayedLoading(isLoading);

    // 날짜별로 그룹핑
    const grouped = useMemo(() => {
        // 완료 상태만 보기
        // TODO : 추후에 카테고라이징 / 기타 필터 / 검색 기능 추가 시 백엔드에서 처리
        console.log(filterCompleted);
        const filteredReminders = filterCompleted
            ? reminders.filter((reminder) => reminder.isCompleted)
            : reminders;

        const result: { date: string | null; items: Reminder[] }[] = [];

        filteredReminders.forEach((reminder) => {
            const lastGroup = result[result.length - 1];
            if (!reminder.date) return;
            const currentDate = CalendarUtils.formatDateDisplay(reminder.date);

            if (lastGroup && lastGroup.date === currentDate) {
                lastGroup.items.push(reminder);
            } else {
                result.push({
                    // TODO : date 타입 체크...
                    date: currentDate ? String(currentDate) : null,
                    items: [reminder],
                });
            }
        });

        return result;
    }, [reminders, filterCompleted]);

    if (showSpinner) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loading size="md" color="blue" />
            </div>
        );
    }

    if (reminders.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p>등록된 리마인더가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {grouped.map((group) => (
                <div key={group.date || 'no-date'}>
                    <div className="px-4 py-2">
                        <h3 className="text-sm font-semibold text-gray-600">
                            {group.date
                                ? format(new Date(group.date), 'M월 d일 (E)', {
                                      locale: ko,
                                  })
                                : '날짜 미지정'}
                        </h3>
                    </div>

                    {/* 리마인더 목록 */}
                    <div className="divide-y divide-gray-200">
                        {group.items.map((reminder) => (
                            <ReminderItem
                                key={reminder.id}
                                reminder={reminder}
                                onEditReminder={onEditReminder}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
