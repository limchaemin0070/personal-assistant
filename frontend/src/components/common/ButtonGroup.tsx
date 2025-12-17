import { cn } from '@/utils/cn';

export interface ButtonGroupOption<T = string> {
    value: T;
    label: string;
}

interface ButtonGroupProps<T = string> {
    options: ButtonGroupOption<T>[];
    value: T | T[];
    onChange: (value: T | T[]) => void;
    multiple?: boolean;
    className?: string;
}

// 공통 버튼 스타일
const buttonBaseStyles =
    'px-2 py-1 text-sm rounded transition-colors duration-200 cursor-pointer';

// 선택된 버튼 스타일
const buttonActiveStyles = 'bg-gray-200 font-medium text-gray-900';

// 비선택된 버튼 스타일
const buttonInactiveStyles = 'hover:bg-gray-100 text-gray-600';

export const ButtonGroup = <T extends string | number = string>({
    options,
    value,
    onChange,
    multiple = false,
    className,
}: ButtonGroupProps<T>) => {
    const handleClick = (optionValue: T) => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : [];
            const isSelected = currentValues.includes(optionValue);

            if (isSelected) {
                // 선택 해제
                onChange(currentValues.filter((v) => v !== optionValue) as T[]);
            } else {
                // 선택 추가
                onChange([...currentValues, optionValue] as T[]);
            }
        } else {
            // 단일 선택
            onChange(optionValue);
        }
    };

    const isOptionSelected = (optionValue: T): boolean => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : [];
            return currentValues.includes(optionValue);
        }
        return value === optionValue;
    };

    return (
        <div className={cn('flex gap-0.5', className)}>
            {options.map((option) => {
                const isActive = isOptionSelected(option.value);
                return (
                    <button
                        key={String(option.value)}
                        type="button"
                        onClick={() => handleClick(option.value)}
                        className={cn(
                            buttonBaseStyles,
                            isActive
                                ? buttonActiveStyles
                                : buttonInactiveStyles,
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};
