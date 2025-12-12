import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { IoTimeOutline } from 'react-icons/io5';
import { FormToggle } from '@/components/common/Form/input';
import {
    DateRangeSection,
    TimeRangeSection,
} from '@/components/common/Form/Section';

/**
 * 이벤트(일정) 전용 날짜/시간 섹션
 * - 날짜 범위 (시작날짜/끝날짜)
 * - 종일 토글 버튼
 * - 시간 범위 (시작시간/끝시간) - 종일이 아닐 때
 */
export const EventDateTimeSection = () => {
    const { watch, setValue } = useFormContext();
    const isAllDay = watch('is_all_day');
    const startTime = watch('start_time');
    const endTime = watch('end_time');
    const previousStartTimeRef = useRef<string | null>(null);
    const previousEndTimeRef = useRef<string | null>(null);

    useEffect(() => {
        if (isAllDay) {
            if (startTime) {
                previousStartTimeRef.current = startTime;
            }
            if (endTime) {
                previousEndTimeRef.current = endTime;
            }
            setValue('start_time', null);
            setValue('end_time', null);
            return;
        }
        if (previousStartTimeRef.current) {
            setValue('start_time', previousStartTimeRef.current);
            previousStartTimeRef.current = null;
        } else if (!startTime) {
            setValue('start_time', '09:00');
        }
        if (previousEndTimeRef.current) {
            setValue('end_time', previousEndTimeRef.current);
            previousEndTimeRef.current = null;
        } else if (!endTime) {
            setValue('end_time', '10:00');
        }
    }, [isAllDay, setValue, startTime, endTime]);

    return (
        <section className="space-y-4">
            <DateRangeSection
                startDateName="start_date"
                endDateName="end_date"
                autoAdjustEndDate
            />
            <div className="flex items-center gap-2">
                <IoTimeOutline className="shrink-0" />
                <FormToggle
                    name="is_all_day"
                    label="하루 종일"
                    size="sm"
                    labelPosition="left"
                />
            </div>
            {!isAllDay && (
                <TimeRangeSection
                    startTimeName="start_time"
                    endTimeName="end_time"
                    startDateName="start_date"
                    endDateName="end_date"
                    autoAdjustEndTime
                    minDurationMinutes={60}
                />
            )}
        </section>
    );
};
