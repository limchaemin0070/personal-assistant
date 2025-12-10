import { useFormContext, useController } from 'react-hook-form';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface FormDateInputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'type'> {
    name: string;
    label?: string;
    helpText?: string;
}

/**
 * React Hook Form 통합 날짜 입력 컴포넌트
 */
export const FormDateInput = ({
    name,
    label,
    helpText,
    className,
    ...inputProps
}: FormDateInputProps) => {
    const { control } = useFormContext();
    const {
        field,
        fieldState: { error },
    } = useController({
        name,
        control,
    });

    const inputId = inputProps.id || name;
    const errorId = `${inputId}-error`;
    const helpTextId = `${inputId}-help`;

    let describedBy: string | undefined;
    if (error) {
        describedBy = errorId;
    } else if (helpText) {
        describedBy = helpTextId;
    }

    return (
        <div className="input-group">
            {label && (
                <label
                    htmlFor={inputId}
                    className={cn(
                        'input-label',
                        inputProps.required && 'input-label-required',
                    )}
                >
                    {label}
                </label>
            )}

            <input
                {...field}
                {...inputProps}
                type="date"
                id={inputId}
                className={cn(
                    'input-base',
                    label && 'mt-2',
                    error && 'input-error',
                    className,
                )}
                aria-invalid={!!error}
                aria-describedby={describedBy}
            />

            {error && (
                <span id={errorId} className="input-error-message" role="alert">
                    {error.message}
                </span>
            )}

            {helpText && !error && (
                <span id={helpTextId} className="input-help-text">
                    {helpText}
                </span>
            )}
        </div>
    );
};
