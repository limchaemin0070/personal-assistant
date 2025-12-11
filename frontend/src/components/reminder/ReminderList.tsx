import { useMemo } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Reminder } from '@/types';
import { ReminderItem } from './ReminderItem';
import { useReminder } from '@/hooks/reminder/useReminder';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';

export const ReminderList = () => {
    const { data: reminders = [], isLoading } = useReminder();

    // 날짜별로 그룹핑
    const grouped = useMemo(() => {
        const result: { date: string | null; items: Reminder[] }[] = [];

        reminders.forEach((reminder) => {
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

        console.log(result);

        return result;
    }, [reminders]);

    if (isLoading) {
        return <div className="p-4">로딩 중...</div>;
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
                    {/* 섹션 헤더 */}
                    <div className="px-4 py-2 sticky top-0">
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
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
