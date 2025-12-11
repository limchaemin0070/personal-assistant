import { useId } from 'react';
import { cn } from '@/utils/cn';

interface ToggleProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    label: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * 토글 버튼 스타일의 체크박스 컴포넌트
 * 체크박스 기능은 동일하지만 시각적으로 토글 버튼처럼 표시됩니다.
 */
export const Toggle = ({
    checked,
    onCheckedChange,
    disabled = false,
    label,
    className = '',
    size = 'md',
}: ToggleProps) => {
    const id = useId();

    const sizeClasses = {
        sm: {
            track: 'w-10 h-6',
            thumb: 'w-5 h-5',
            translate: checked ? 'translate-x-4' : 'translate-x-0.5',
        },
        md: {
            track: 'w-12 h-7',
            thumb: 'w-6 h-6',
            translate: checked ? 'translate-x-5' : 'translate-x-0.5',
        },
        lg: {
            track: 'w-14 h-8',
            thumb: 'w-7 h-7',
            translate: checked ? 'translate-x-6' : 'translate-x-0.5',
        },
    };

    const sizeConfig = sizeClasses[size];

    return (
        <label
            htmlFor={id}
            className={cn(
                'inline-flex items-center gap-3 cursor-pointer',
                disabled && 'opacity-50 cursor-not-allowed',
                className,
            )}
        >
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(e) => onCheckedChange(e.target.checked)}
                disabled={disabled}
                className="sr-only"
            />
            <div
                className={cn(
                    'relative rounded-full transition-colors duration-200',
                    sizeConfig.track,
                    checked ? 'bg-blue-500' : 'bg-gray-300',
                    disabled && 'cursor-not-allowed',
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
            <span className="text-sm font-medium text-gray-700 select-none">
                {label}
            </span>
        </label>
    );
};
