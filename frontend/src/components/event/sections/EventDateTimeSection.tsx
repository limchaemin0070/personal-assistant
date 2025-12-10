import { useFormContext } from 'react-hook-form';
import { FormCheckbox } from '@/components/common/Form/input';
import {
    DateRangeSection,
    TimeRangeSection,
} from '@/components/common/Form/Section';

/**
 * 이벤트(일정) 전용 날짜/시간 섹션
 * - 날짜 범위
 * - 종일 체크박스
 * - 시간 범위 (종일이 아닐 때)
 */
export const EventDateTimeSection = () => {
    const { watch, setValue } = useFormContext();
    const isAllDay = watch('is_all_day');

    return (
        <section className="space-y-4">
            <DateRangeSection
                startDateName="start_date"
                endDateName="end_date"
                autoAdjustEndDate
            />
            <FormCheckbox
                name="is_all_day"
                label="종일"
                onChange={(e) => {
                    if (e.target.checked) {
                        setValue('start_time', null);
                        setValue('end_time', null);
                    } else {
                        setValue('start_time', '09:00');
                        setValue('end_time', '10:00');
                    }
                }}
            />
            {!isAllDay && (
                <TimeRangeSection
                    startTimeName="start_time"
                    endTimeName="end_time"
                    startDateName="start_date"
                    endDateName="end_date"
                    autoAdjustEndTime
                    minDurationMinutes={60} // 이벤트는 최소 1시간
                />
            )}
        </section>
    );
};
