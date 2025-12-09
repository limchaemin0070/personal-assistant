import React from 'react';
import { cn } from '@/utils/cn';

interface TimeInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    id?: string;
    name?: string;
    helpText?: string;
}

/**
 * 시간 입력 폼 컴포넌트
 *
 * 순수하게 시간 입력만 담당하는 컴포넌트
 * - 알람: 이 컴포넌트를 직접 사용 (종일 옵션 불필요)
 * - 스케줄/리마인더: AllDayCheckbox와 함께 조합하여 사용
 *
 * @example
 * // 알람에서 사용
 * <TimeInput
 *   label="알람 시간"
 *   value={alarmTime}
 *   onChange={setAlarmTime}
 *   required
 * />
 *
 * @example
 * // 스케줄/리마인더에서 사용 (AllDayCheckbox와 함께)
 * <AllDayCheckbox checked={isAllDay} onChange={setIsAllDay} />
 * {!isAllDay && (
 *   <TimeInput
 *     label="시작 시간"
 *     value={startTime}
 *     onChange={setStartTime}
 *     required
 *   />
 * )}
 */
export const TimeInput: React.FC<TimeInputProps> = ({
    label,
    value,
    onChange,
    error,
    required = false,
    disabled,
    id,
    name,
    helpText,
}) => {
    const inputId = id || name;
    const errorId = inputId ? `${inputId}-error` : undefined;
    const helpTextId = inputId ? `${inputId}-help` : undefined;
    let describedBy: string | undefined;
    if (error && errorId) {
        describedBy = errorId;
    } else if (helpText && helpTextId) {
        describedBy = helpTextId;
    }

    return (
        <div className="input-group">
            <label
                htmlFor={inputId}
                className={cn(
                    'input-label',
                    required && 'input-label-required',
                )}
            >
                {label}
            </label>
            <input
                id={inputId}
                name={name}
                type="time"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn('input-base mt-2', error && 'input-error')}
                disabled={disabled}
                aria-invalid={!!error}
                aria-describedby={describedBy}
            />
            {error && errorId && (
                <span id={errorId} className="input-error-message" role="alert">
                    {error}
                </span>
            )}
            {helpText && !error && helpTextId && (
                <span id={helpTextId} className="input-help-text">
                    {helpText}
                </span>
            )}
        </div>
    );
};
