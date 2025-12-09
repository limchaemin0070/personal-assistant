import React from 'react';
import { cn } from '@/utils/cn';

interface FormInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    helpText?: string;
    required?: boolean;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    maxLength?: number;
    autoComplete?: React.InputHTMLAttributes<HTMLInputElement>['autoComplete'];
}

export const FormInput: React.FC<FormInputProps> = ({
    label,
    name,
    value,
    onChange,
    error,
    helpText,
    required = false,
    type = 'text',
    placeholder,
    disabled,
    maxLength,
    autoComplete,
}) => {
    const errorId = `${name}-error`;
    const helpTextId = `${name}-help`;
    let describedBy: string | undefined;
    if (error) {
        describedBy = errorId;
    } else if (helpText) {
        describedBy = helpTextId;
    }

    return (
        <div className="input-group">
            {/* Label */}
            <label
                htmlFor={name}
                className={cn(
                    'input-label',
                    required && 'input-label-required',
                )}
            >
                {label}
            </label>

            {/* Input */}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn('input-base mt-2', error && 'input-error')}
                aria-invalid={!!error}
                aria-describedby={describedBy}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={maxLength}
                autoComplete={autoComplete}
            />

            {/* Error Message */}
            {error && (
                <span id={errorId} className="input-error-message" role="alert">
                    {error}
                </span>
            )}

            {/* Help Text */}
            {helpText && !error && (
                <span id={helpTextId} className="input-help-text">
                    {helpText}
                </span>
            )}
        </div>
    );
};
