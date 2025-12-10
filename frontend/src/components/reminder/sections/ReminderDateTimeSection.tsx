import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import {
    FormDate,
    FormCheckbox,
    FormTime,
} from '@/components/common/Form/input';

interface ReminderDateTimeSectionProps {
    dateName?: string;
    timeName?: string;
    isAllDayName?: string;
    dateLabel?: string;
    timeLabel?: string;
    defaultShowTime?: boolean;
}

/**
 * 리마인더 전용 날짜/시간 섹션
 * - 날짜: 항상 표시
 * - 시간: 토글 가능 (기본 숨김)
 * - 종일: 시간 섹션 표시 시 사용 가능
 */
export const ReminderDateTimeSection = ({
    dateName = 'date',
    timeName = 'time',
    isAllDayName = 'is_all_day',
    dateLabel = '날짜',
    timeLabel = '시간',
    defaultShowTime = false,
}: ReminderDateTimeSectionProps) => {
    const { watch, setValue } = useFormContext();
    const [showTimeSection, setShowTimeSection] = useState(defaultShowTime);

    const isAllDay = watch(isAllDayName);
    const currentTime = watch(timeName);

    // 종일 체크박스 변경 시 시간 값 자동 설정
    useEffect(() => {
        if (!showTimeSection) return;

        if (isAllDay) {
            setValue(timeName, null);
        } else if (!currentTime) {
            // 시간이 없을 때만 기본값 설정
            setValue(timeName, '09:00');
        }
    }, [isAllDay, showTimeSection, setValue, timeName, currentTime]);

    // 시간 섹션 표시
    const handleShowTime = () => {
        setShowTimeSection(true);
    };

    // 시간 섹션 숨김
    const handleHideTime = () => {
        setShowTimeSection(false);
        setValue(isAllDayName, true);
        setValue(timeName, null);
    };

    return (
        <section className="space-y-4">
            {/* 날짜 (항상 표시) */}
            <FormDate name={dateName} label={dateLabel} required={false} />
            {!showTimeSection ? (
                <button
                    type="button"
                    onClick={handleShowTime}
                    className="text-sm text-blue-600 hover:text-blue-800 underline text-left"
                >
                    시간 +
                </button>
            ) : (
                <div className="space-y-3">
                    {/* 시간 섹션 숨기기 버튼 */}
                    <button
                        type="button"
                        onClick={handleHideTime}
                        className="text-sm text-gray-600 hover:text-gray-800 underline text-left"
                    >
                        X
                    </button>
                    {/* 종일 체크박스 */}
                    <FormCheckbox name={isAllDayName} label="종일" />
                    {/* 시간 필드 (종일이 아닐 때만) */}
                    {!isAllDay && (
                        <FormTime
                            name={timeName}
                            label={timeLabel}
                            required={false}
                        />
                    )}
                </div>
            )}
        </section>
    );
};
