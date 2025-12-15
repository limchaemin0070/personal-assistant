import React from 'react';
import { ko } from 'date-fns/locale';
import { format } from 'date-fns';
import type { Alarm } from '@/types/alarm';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import { useDeleteAlarm } from '@/hooks/alarm/useDeleteAlarm';
import { useToggleAlarmActive } from '@/hooks/alarm/useToggleAlarmActive';
import { cn } from '@/utils/cn';
import { DeleteButton } from '../common/Button/DeleteButton';
import { Toggle } from '../common/Toggle';
import {
    getWeekDayLabel,
    WEEK_DAYS,
    type DayOfWeek,
} from '@/constants/weekDays';

type AlarmItemProps = {
    alarm: Alarm;
    onEditAlarm: (alarm: Alarm) => void;
};

export const AlarmItem: React.FC<AlarmItemProps> = ({ alarm, onEditAlarm }) => {
    const { title, time, date, is_repeat, repeat_days, is_active } = alarm;

    const deleteAlarm = useDeleteAlarm();
    const toggleAlarm = useToggleAlarmActive();

    const handleDelete = () => {
        deleteAlarm.mutateAsync(alarm.id);
    };

    const handleToggleActive = (checked: boolean) => {
        toggleAlarm.mutateAsync({
            alarmId: alarm.id,
            isActive: checked,
        });
    };

    const handleItemClick = () => {
        onEditAlarm(alarm);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleItemClick();
        }
    };

    // 시간 표시
    const displayTime = CalendarUtils.formatTimeKorean(time);

    // 날짜 표시
    const displayDate = () => {
        if (date) {
            return format(new Date(date), 'M월 d일 (E)', { locale: ko });
        }
        return null;
    };

    const dateText = displayDate();

    // 요일 표시용: 일~토 순으로 정렬된 모든 요일
    const allDays = WEEK_DAYS.map((day) => day.value);
    const activeDaysSet = new Set(repeat_days as DayOfWeek[]);

    return (
        <div
            className={cn(
                'flex items-center justify-between px-4 py-3 text-sm transition-colors duration-200 rounded-md h-25 relative cursor-pointer',
                is_active
                    ? 'bg-stone-50 hover:bg-stone-200'
                    : 'bg-gray-50 hover:bg-gray-100 opacity-75',
            )}
            onClick={handleItemClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
        >
            <div className="flex flex-col min-w-0 flex-1">
                {title && title.trim() && (
                    <span
                        className={cn(
                            'text-xs font-medium truncate absolute top-5 left-4.5',
                            is_active
                                ? 'text-gray-700'
                                : 'text-gray-400 line-through',
                        )}
                    >
                        {title}
                    </span>
                )}
                <span
                    className={cn(
                        'text-lg font-extrabold leading-tight',
                        is_active ? 'text-gray-900' : 'text-gray-500',
                    )}
                >
                    {displayTime}
                </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {is_repeat && repeat_days && repeat_days.length > 0 ? (
                    <div className="flex items-center -space-x-0.5">
                        {allDays.map((day) => {
                            const isActive = activeDaysSet.has(day);
                            let textColor = 'text-gray-300';
                            if (isActive) {
                                textColor = 'text-blue-600';
                            } else if (is_active) {
                                textColor = 'text-gray-400';
                            }
                            return (
                                <span
                                    key={day}
                                    className={cn(
                                        'text-xs font-medium w-4 text-center',
                                        textColor,
                                    )}
                                >
                                    {getWeekDayLabel(day)}
                                </span>
                            );
                        })}
                    </div>
                ) : (
                    dateText && (
                        <span
                            className={cn(
                                'text-xs whitespace-nowrap',
                                is_active ? 'text-gray-600' : 'text-gray-400',
                            )}
                        >
                            {dateText}
                        </span>
                    )
                )}
                <div
                    className="flex gap-2 shrink-0 absolute top-2 right-2"
                    onClick={(e) => e.stopPropagation()}
                    role="presentation"
                >
                    <DeleteButton
                        onClick={handleDelete}
                        size="sm"
                        aria-label="알람 삭제"
                        disabled={deleteAlarm.isPending}
                    />
                </div>
                <div
                    onClick={(e) => e.stopPropagation()}
                    role="presentation"
                    className="shrink-0 flex items-center justify-center"
                >
                    <Toggle
                        checked={is_active}
                        onCheckedChange={handleToggleActive}
                        disabled={
                            toggleAlarm.isPending || deleteAlarm.isPending
                        }
                        label=""
                        size="sm"
                        aria-label="알람 활성화"
                    />
                </div>
            </div>
        </div>
    );
};
