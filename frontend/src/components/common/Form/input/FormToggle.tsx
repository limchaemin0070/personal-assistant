import { useFormContext, useController } from 'react-hook-form';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface FormToggleProps
    extends Omit<
        InputHTMLAttributes<HTMLInputElement>,
        'name' | 'type' | 'size'
    > {
    name: string;
    label: string;
    activeIcon?: ReactNode;
    inactiveIcon?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    labelPosition?: 'left' | 'right';
}

/**
 * React Hook Form 통합 토글 버튼 컴포넌트
 * 체크박스 기능은 동일하지만 시각적으로 토글 버튼처럼 표시됩니다.
 */
export const FormToggle = ({
    name,
    label,
    activeIcon,
    inactiveIcon,
    className,
    size = 'md',
    labelPosition = 'right',
    ...inputProps
}: FormToggleProps) => {
    const { control } = useFormContext();
    const { field } = useController({
        name,
        control,
    });

    const inputId = inputProps.id || name;

    const sizeClasses = {
        sm: {
            track: 'w-10 h-6',
            thumb: 'w-5 h-5',
            translate: field.value ? 'translate-x-4' : 'translate-x-0.5',
        },
        md: {
            track: 'w-12 h-7',
            thumb: 'w-6 h-6',
            translate: field.value ? 'translate-x-5' : 'translate-x-0.5',
        },
        lg: {
            track: 'w-14 h-8',
            thumb: 'w-7 h-7',
            translate: field.value ? 'translate-x-6' : 'translate-x-0.5',
        },
    };

    const sizeConfig = sizeClasses[size];

    const toggleButton = (
        <div
            className={cn(
                'relative rounded-full transition-colors duration-200',
                sizeConfig.track,
                field.value ? 'bg-blue-500' : 'bg-gray-300',
            )}
        >
            <div
                className={cn(
                    'absolute top-0.5 rounded-full bg-white shadow-md transition-transform duration-200',
                    sizeConfig.thumb,
                    sizeConfig.translate,
                )}
            />
        </div>
    );

    const currentIcon = field.value ? activeIcon : inactiveIcon;
    const hasIcon = activeIcon || inactiveIcon;

    const labelElement = (
        <span className="text-sm font-medium text-gray-700 select-none">
            {hasIcon && currentIcon ? (
                <span className="flex items-center gap-2">
                    <span className="shrink-0">{currentIcon}</span>
                    {label}
                </span>
            ) : (
                label
            )}
        </span>
    );

    return (
        <div className={cn('flex items-center gap-3', className)}>
            <label
                htmlFor={inputId}
                className="inline-flex items-center gap-3 cursor-pointer"
            >
                <input
                    {...field}
                    {...inputProps}
                    type="checkbox"
                    id={inputId}
                    checked={field.value || false}
                    value={undefined} // checkbox는 checked 사용
                    className="sr-only"
                />
                {labelPosition === 'left' ? (
                    <>
                        {labelElement}
                        {toggleButton}
                    </>
                ) : (
                    <>
                        {toggleButton}
                        {labelElement}
                    </>
                )}
            </label>
        </div>
    );
};
