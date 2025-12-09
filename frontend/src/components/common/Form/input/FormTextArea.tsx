import React from 'react';
import { cn } from '@/utils/cn';

interface TextareaFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    maxLength?: number;
    rows?: number;
    disabled?: boolean;
    id?: string;
    name?: string;
    showCharCount?: boolean;
    helpText?: string;
}

/**
 * 텍스트 입력 폼
 * @param param0
 * @returns
 */
export const TextareaField: React.FC<TextareaFieldProps> = ({
    label,
    value,
    onChange,
    error,
    placeholder,
    maxLength,
    rows = 3,
    disabled,
    id,
    name,
    showCharCount = false,
    helpText,
}) => {
    const inputId = id || name;
    const errorId = inputId ? `${inputId}-error` : undefined;
    const helpTextId = inputId ? `${inputId}-help` : undefined;
    const charCountHelp =
        showCharCount && maxLength
            ? `${value.length} / ${maxLength}자`
            : undefined;
    const resolvedHelpText = !error ? charCountHelp || helpText : undefined;
    let describedBy: string | undefined;
    if (error && errorId) {
        describedBy = errorId;
    } else if (resolvedHelpText && helpTextId) {
        describedBy = helpTextId;
    }

    return (
        <div className="input-group">
            <label className="input-label" htmlFor={inputId}>
                {label}
            </label>
            <textarea
                id={inputId}
                name={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={cn('textarea-base mt-2', error && 'input-error')}
                rows={rows}
                maxLength={maxLength}
                disabled={disabled}
                aria-invalid={!!error}
                aria-describedby={describedBy}
            />
            {error && errorId && (
                <span id={errorId} className="input-error-message" role="alert">
                    {error}
                </span>
            )}
            {resolvedHelpText && helpTextId && (
                <span id={helpTextId} className="input-help-text">
                    {resolvedHelpText}
                </span>
            )}
        </div>
    );
};
