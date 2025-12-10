import { useFormContext, useController } from 'react-hook-form';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface FormCheckboxProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'type'> {
    name: string;
    label: string;
}

/**
 * React Hook Form 통합 체크박스 컴포넌트
 */
export const FormCheckbox = ({
    name,
    label,
    className,
    ...inputProps
}: FormCheckboxProps) => {
    const { control } = useFormContext();
    const { field } = useController({
        name,
        control,
    });

    const inputId = inputProps.id || name;

    return (
        <div className="flex items-center gap-2">
            <input
                {...field}
                {...inputProps}
                type="checkbox"
                id={inputId}
                checked={field.value}
                value={undefined} // checkbox는 checked 사용
                className={cn('checkbox-base', className)}
            />
            <label
                htmlFor={inputId}
                className="text-sm font-medium text-gray-700 cursor-pointer"
            >
                {label}
            </label>
        </div>
    );
};
