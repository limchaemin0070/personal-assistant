import React from 'react';
import type { Alarm } from '@/types/alarm';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import { useDeleteAlarm } from '@/hooks/alarm/useDeleteAlarm';
import { cn } from '@/utils/cn';
import { DeleteButton } from '../common/Button/DeleteButton';
import { UpdateButton } from '../common/Button/UpdateButton';
import { getWeekDayLabels, type DayOfWeek } from '@/constants/weekDays';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

type AlarmItemProps = {
    alarm: Alarm;
    onEditAlarm: (alarm: Alarm) => void;
};

export const AlarmItem: React.FC<AlarmItemProps> = ({ alarm, onEditAlarm }) => {
    const { title, time, date, is_repeat, repeat_days, is_active } = alarm;

    const deleteAlarm = useDeleteAlarm();

    const handleEdit = () => {
        onEditAlarm(alarm);
    };

    const handleDelete = () => {
        deleteAlarm.mutateAsync(alarm.id);
    };

    // 시간 표시
    const displayTime = CalendarUtils.formatTimeKorean(time);

    // 날짜/요일 표시
    const displayDateOrDay = () => {
        if (is_repeat && repeat_days && repeat_days.length > 0) {
            // 반복 알람: 요일 표시
            const dayLabels = getWeekDayLabels(repeat_days as DayOfWeek[]);
            return `매주 ${dayLabels.join(', ')}`;
        }
        if (date) {
            // 날짜 지정 알람: 날짜 표시
            return format(new Date(date), 'M월 d일 (E)', { locale: ko });
        }
        return null;
    };

    const dateOrDayText = displayDateOrDay();

    return (
        <div
            className={cn(
                'flex',
                'items-center',
                'px-4',
                'py-3',
                'text-sm',
                'transition-colors',
                'duration-200',
                'rounded-md',
                'gap-4',
                is_active
                    ? 'bg-stone-50 hover:bg-stone-200'
                    : 'bg-gray-50 hover:bg-gray-100 opacity-75',
            )}
        >
            {/* 좌측: 시간 (크게) + 제목 (시간 하단) */}
            <div className="flex flex-col min-w-0 flex-1">
                <span
                    className={cn(
                        'text-lg',
                        'font-semibold',
                        'leading-tight',
                        is_active ? 'text-gray-900' : 'text-gray-500',
                    )}
                >
                    {displayTime}
                </span>
                {title && title.trim() && (
                    <span
                        className={cn(
                            'text-sm',
                            'font-medium',
                            'mt-1',
                            'truncate',
                            is_active ? 'text-gray-700' : 'text-gray-400 line-through',
                        )}
                    >
                        {title}
                    </span>
                )}
            </div>

            {/* 우측: 날짜/요일 + 버튼 */}
            <div className="flex items-center gap-3 shrink-0">
                {dateOrDayText && (
                    <span
                        className={cn(
                            'text-xs',
                            'whitespace-nowrap',
                            is_active ? 'text-gray-600' : 'text-gray-400',
                        )}
                    >
                        {dateOrDayText}
                    </span>
                )}
                <div className="flex gap-2 shrink-0">
                    <UpdateButton
                        onClick={handleEdit}
                        size="sm"
                        aria-label="알람 수정"
                        disabled={deleteAlarm.isPending}
                    />
                    <DeleteButton
                        onClick={handleDelete}
                        size="sm"
                        aria-label="알람 삭제"
                        disabled={deleteAlarm.isPending}
                    />
                </div>
            </div>
        </div>
    );
};

