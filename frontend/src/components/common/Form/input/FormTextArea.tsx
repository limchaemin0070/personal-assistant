import { useFormContext, useController } from 'react-hook-form';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface FormTextAreaProps
    extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
    name: string;
    label?: string;
    helpText?: string;
    showCharCount?: boolean;
}

/**
 * React Hook Form 통합 텍스트 영역 컴포넌트
 */
export const FormTextArea = ({
    name,
    label,
    helpText,
    showCharCount = false,
    className,
    rows = 3,
    maxLength,
    ...textareaProps
}: FormTextAreaProps) => {
    const { control } = useFormContext();
    const {
        field,
        fieldState: { error },
    } = useController({
        name,
        control,
    });

    const textareaId = textareaProps.id || name;
    const errorId = `${textareaId}-error`;
    const helpTextId = `${textareaId}-help`;

    // 문자 수 계산
    const currentLength = field.value?.length || 0;
    const charCountText =
        showCharCount && maxLength && currentLength > 0
            ? `${currentLength} / ${maxLength}자`
            : undefined;

    // helpText와 charCount 중 하나 선택
    const resolvedHelpText = !error ? charCountText || helpText : undefined;

    let describedBy: string | undefined;
    if (error) {
        describedBy = errorId;
    } else if (resolvedHelpText) {
        describedBy = helpTextId;
    }

    return (
        <div className="input-group">
            {label && (
                <label
                    htmlFor={textareaId}
                    className={cn(
                        'input-label',
                        textareaProps.required && 'input-label-required',
                    )}
                >
                    {label}
                </label>
            )}

            <textarea
                {...field}
                {...textareaProps}
                id={textareaId}
                rows={rows}
                maxLength={maxLength}
                className={cn(
                    'textarea-base',
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

            {resolvedHelpText && (
                <span id={helpTextId} className="input-help-text">
                    {resolvedHelpText}
                </span>
            )}
        </div>
    );
};
