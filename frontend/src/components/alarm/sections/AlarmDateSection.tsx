import React, { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormDate, FormSelectDropdown } from '@/components/common/Form/input';
import {
    WEEK_DAYS,
    getWeekDayLabels,
    type DayOfWeek,
} from '@/constants/weekDays';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';

interface AlarmDateSectionProps {
    repeatDaysName?: string;
    dateName?: string;
    multiple?: boolean;
    label?: string;
}

export const AlarmDateSection: React.FC<AlarmDateSectionProps> = ({
    repeatDaysName = 'repeat_days',
    dateName = 'date',
    multiple = true,
    label = '반복 요일',
}) => {
    const { watch, setValue } = useFormContext();

    const repeatDays = watch(repeatDaysName);
    const date = watch(dateName);

    const repeatDaysLength = repeatDays?.length ?? 0;
    const prevValuesRef = useRef({ date, repeatDaysLength });

    useEffect(() => {
        const prev = prevValuesRef.current;

        const dateChanged = prev.date !== date;
        const repeatDaysChanged = prev.repeatDaysLength !== repeatDaysLength;

        if (!dateChanged && !repeatDaysChanged) return;

        if (dateChanged && date && repeatDaysLength > 0) {
            // date가 변경됨 → repeatDays 초기화
            setValue(repeatDaysName, [], {
                shouldValidate: false,
                shouldDirty: false,
                shouldTouch: false,
            });
        } else if (repeatDaysChanged && repeatDaysLength > 0 && date) {
            // repeatDays가 변경됨 → date 초기화
            setValue(dateName, '', {
                shouldValidate: false,
                shouldDirty: false,
                shouldTouch: false,
            });
        }

        prevValuesRef.current = { date, repeatDaysLength };
    }, [date, repeatDaysLength, setValue, dateName, repeatDaysName]);

    const renderText = () => {
        if (repeatDays && repeatDays.length > 0) {
            // 선택된 요일들을 일~토 순서로 정렬
            const sortedDays = [...(repeatDays as DayOfWeek[])].sort(
                (a, b) => a - b,
            );
            const dayLabels = getWeekDayLabels(sortedDays);
            return <div>매주 {dayLabels.join(', ')}</div>;
        }
        if (date) {
            return <div>{date}</div>;
        }
        return null;
    };

    return (
        <div>
            {renderText()}
            <FormDate
                name={dateName}
                min={CalendarUtils.getDateKey(new Date())}
            />
            <FormSelectDropdown
                name={repeatDaysName}
                options={WEEK_DAYS}
                multiple={multiple}
                label={label}
            />
        </div>
    );
};
