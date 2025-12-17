import type { ReactNode } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { buttonVariants } from './Button.style';
import { cn } from '@/utils/cn';

interface SwitchButtonProps extends VariantProps<typeof buttonVariants> {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    activeIcon: ReactNode;
    inactiveIcon: ReactNode;
    disabled?: boolean;
    className?: string;
    'aria-label'?: string;
}

/**
 * 아이콘이 상태에 따라 변경되는 스위치 버튼 컴포넌트
 * 좋아요, 알람 설정 등에서 사용
 */
export const SwitchButton = ({
    checked,
    onCheckedChange,
    activeIcon,
    inactiveIcon,
    variant = 'primary',
    size = 'md',
    disabled = false,
    className,
    'aria-label': ariaLabel,
}: SwitchButtonProps) => {
    const iconSizes = {
        sm: 'w-5 h-5',
        md: 'w-6 h-6',
        lg: 'w-7 h-7',
    };

    const iconSize = iconSizes[size ?? 'md'];
    const currentIcon = checked ? activeIcon : inactiveIcon;

    return (
        <button
            type="button"
            onClick={() => onCheckedChange(!checked)}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-pressed={checked}
            className={cn(
                buttonVariants({ variant, size }),
                'flex items-center justify-center',
                className,
            )}
        >
            <span className={cn(iconSize, 'transition-transform duration-200')}>
                {currentIcon}
            </span>
        </button>
    );
};
