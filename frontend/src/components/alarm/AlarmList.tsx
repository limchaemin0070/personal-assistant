import { useMemo } from 'react';
import type { Alarm } from '@/types/alarm';
import { AlarmItem } from './AlarmItem';
import { useAlarm } from '@/hooks/alarm/useAlarm';

interface AlarmListProps {
    onEditAlarm: (alarm: Alarm) => void;
}

export const AlarmList = ({ onEditAlarm }: AlarmListProps) => {
    const { data: alarms = [], isLoading } = useAlarm();

    // 정렬된 알람 목록
    const sortedAlarms = useMemo(() => {
        return [...alarms].sort((a, b) => {
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
    }, [alarms]);

    if (isLoading) {
        return <div className="p-4">로딩 중...</div>;
    }

    if (sortedAlarms.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p>등록된 알람이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <div className="divide-y divide-gray-200">
                {sortedAlarms.map((alarm) => (
                    <AlarmItem
                        key={alarm.id}
                        alarm={alarm}
                        onEditAlarm={onEditAlarm}
                    />
                ))}
            </div>
        </div>
    );
};

