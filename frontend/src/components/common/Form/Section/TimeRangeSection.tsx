// components/common/forms/sections/DateRangeSection.tsx
import { useFormContext } from 'react-hook-form';
import { useEffect } from 'react';
import { FormTime } from '../input';
import { TimeUtils } from '@/utils/time/TimeUtils';

interface TimeRangeSectionProps {
    startTimeName?: string;
    endTimeName?: string;
    startDateName?: string;
    endDateName?: string;
    startLabel?: string;
    endLabel?: string;
    required?: boolean;
    autoAdjustEndTime?: boolean;
    minDurationMinutes?: number;
}

export const TimeRangeSection = ({
    startTimeName = 'start_date',
    endTimeName = 'end_date',
    startDateName = 'start_date',
    endDateName = 'end_date',
    startLabel = '시작 날짜',
    endLabel = '종료 날짜',
    required = true,
    autoAdjustEndTime = true,
    minDurationMinutes = 60,
}: TimeRangeSectionProps) => {
    const { watch, setValue } = useFormContext();

    const startDate = watch(startDateName);
    const endDate = watch(endDateName);
    const startTime = watch(startTimeName);
    const endTime = watch(endTimeName);

    useEffect(() => {
        if (!autoAdjustEndTime || !startTime || !endTime) return;

        if (startDate === endDate) {
            const comparision = TimeUtils.compare(startTime, endTime);

            if (comparision >= 0) {
                const adjustedTime = TimeUtils.addMinutes(
                    startTime,
                    minDurationMinutes,
                );
                setValue(endTime, adjustedTime);
            }
        }
    }, [
        startTime,
        endTime,
        startDate,
        endDate,
        autoAdjustEndTime,
        minDurationMinutes,
        endTimeName,
        setValue,
    ]);

    return (
        <div className="grid grid-cols-2 gap-4">
            <FormTime
                name={startTimeName}
                label={startLabel}
                required={required}
            />
            <FormTime name={endTimeName} label={endLabel} required={required} />
        </div>
    );
};
