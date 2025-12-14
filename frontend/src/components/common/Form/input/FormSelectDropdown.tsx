import { useFormContext, useController } from 'react-hook-form';
import {
    SelectDropdown,
    type SelectOption,
} from '@/components/common/SelectDropdown';
import { cn } from '@/utils/cn';

interface FormSelectDropdownProps<T extends string | number = string> {
    name: string;
    options: SelectOption<T>[];
    multiple?: boolean;
    label?: string;
    helpText?: string;
    className?: string;
}

/**
 * React Hook Form 통합 선택 드롭다운 컴포넌트
 */
export const FormSelectDropdown = <T extends string | number = string>({
    name,
    options,
    multiple = false,
    label,
    helpText,
    className,
}: FormSelectDropdownProps<T>) => {
    const { control } = useFormContext();
    const {
        field,
        fieldState: { error },
    } = useController({
        name,
        control,
    });

    const fieldId = name;
    const errorId = `${fieldId}-error`;
    const helpTextId = `${fieldId}-help`;

    let describedBy: string | undefined;
    if (error) {
        describedBy = errorId;
    } else if (helpText) {
        describedBy = helpTextId;
    }

    return (
        <div className={cn('input-group', className)}>
            {label && (
                <label htmlFor={fieldId} className={cn('input-label')}>
                    {label}
                </label>
            )}

            <div
                id={fieldId}
                role="group"
                aria-describedby={describedBy}
                className={error ? 'aria-invalid' : ''}
            >
                <SelectDropdown
                    options={options}
                    value={field.value ?? (multiple ? [] : '')}
                    onChange={(value) => field.onChange(value)}
                    multiple={multiple}
                />
            </div>

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
