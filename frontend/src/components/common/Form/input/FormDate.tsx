import React from 'react';
import { cn } from '@/utils/cn';

interface DateInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    min?: string;
    disabled?: boolean;
    id?: string;
    name?: string;
    helpText?: string;
}

/**
 * 날짜 입력 폼
 * @param param0
 * @returns
 */
export const DateInput: React.FC<DateInputProps> = ({
    label,
    value,
    onChange,
    error,
    required = false,
    min,
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
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn('input-base mt-2', error && 'input-error')}
                min={min}
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
