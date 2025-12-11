import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { IoTimeOutline } from 'react-icons/io5';
import { FormDate, FormTime, FormToggle } from '@/components/common/Form/input';

interface ReminderDateTimeSectionProps {
    dateName?: string;
    timeName?: string;
    isAllDayName?: string;
}

/**
 * 리마인더 전용 날짜/시간 섹션
 * - 날짜: 항상 표시
 * - 시간: 종일 토글에 따라 표시/숨김
 * - 종일이 아닐 때 기본 시간: 09:00
 * - 종일 해제 시 이전 시간 값 복원
 */
export const ReminderDateTimeSection = ({
    dateName = 'date',
    timeName = 'time',
    isAllDayName = 'is_all_day',
}: ReminderDateTimeSectionProps) => {
    const { watch, setValue } = useFormContext();

    const isAllDay = watch(isAllDayName);
    const currentTime = watch(timeName);
    const previousTimeRef = useRef<string | null>(null);

    useEffect(() => {
        if (isAllDay) {
            if (currentTime) {
                previousTimeRef.current = currentTime;
            }
            setValue(timeName, null);
            return;
        }
        if (previousTimeRef.current) {
            setValue(timeName, previousTimeRef.current);
            previousTimeRef.current = null;
        } else if (!currentTime) {
            setValue(timeName, '09:00');
        }
    }, [isAllDay, setValue, timeName, currentTime]);

    // // 시간 섹션 표시
    // const handleShowTime = () => {
    //     setShowTimeSection(true);
    // };

    // // 시간 섹션 숨김
    // const handleHideTime = () => {
    //     setShowTimeSection(false);
    //     setValue(isAllDayName, true);
    //     setValue(timeName, null);
    // };

    return (
        <section className="space-y-4">
            {/* 날짜 (항상 표시) */}
            <FormDate
                name={dateName}
                required={false}
                className="p-3 border-none"
            />

            {/* 종일 체크박스 */}
            <div className="flex items-center gap-2">
                <IoTimeOutline className="shrink-0" />
                <FormToggle
                    name={isAllDayName}
                    label="하루 종일"
                    size="sm"
                    labelPosition="left"
                />
            </div>
            {!isAllDay && (
                <FormTime
                    name={timeName}
                    required={false}
                    className="p-2 border-none bg-none"
                />
            )}
        </section>
    );
};
