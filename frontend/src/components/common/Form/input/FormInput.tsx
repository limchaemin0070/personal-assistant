import { useFormContext, useController } from 'react-hook-form';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface FormInputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
    name: string;
    label?: string;
    helpText?: string;
}

/**
 * React Hook Form 통합 텍스트 입력 컴포넌트
 */
export const FormInput = ({
    name,
    label,
    helpText,
    className,
    type = 'text',
    ...inputProps
}: FormInputProps) => {
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
                type={type}
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
