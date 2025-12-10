// components/common/forms/sections/DateRangeSection.tsx
import { useFormContext } from 'react-hook-form';
import { useEffect, type ChangeEvent } from 'react';
import { FormDate } from '../input';

interface DateRangeSectionProps {
    startDateName?: string;
    endDateName?: string;
    startLabel?: string;
    endLabel?: string;
    required?: boolean;
    autoAdjustEndDate?: boolean; // 시작일 변경 시 종료일 자동 조정
}

export const DateRangeSection = ({
    startDateName = 'start_date',
    endDateName = 'end_date',
    startLabel = '시작 날짜',
    endLabel = '종료 날짜',
    required = true,
    autoAdjustEndDate = true,
}: DateRangeSectionProps) => {
    const { watch, setValue } = useFormContext();
    const startDate = watch(startDateName);
    const endDate = watch(endDateName);

    // 시작 날짜 변경 시 종료 날짜 자동 조정
    useEffect(() => {
        if (!autoAdjustEndDate || !startDate || !endDate) return;
        if (new Date(startDate) > new Date(endDate)) {
            setValue(endDateName, startDate);
        }
    }, [startDate, endDate, autoAdjustEndDate, endDateName, setValue]);

    return (
        <div className="grid grid-cols-2 gap-4">
            <FormDate
                name={startDateName}
                label={startLabel}
                required={required}
            />
            <FormDate
                name={endDateName}
                label={endLabel}
                required={required}
                min={startDate} // 종료일은 시작일 이후만 선택 가능
            />
        </div>
    );
};
