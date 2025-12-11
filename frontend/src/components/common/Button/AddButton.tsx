import { IoIosAdd, IoIosRemove } from 'react-icons/io';
import type { VariantProps } from 'class-variance-authority';
import { buttonVariants } from './Button.style';
import { cn } from '@/utils/cn';

interface AddButtonProps extends VariantProps<typeof buttonVariants> {
    onClick: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
    'aria-label'?: string;
    isActive?: boolean;
}

/**
 * (+) 아이콘의 추가 버튼
 * 일정/리마인더/알람 추가 등 기능에서 공통 사용
 *
 * @example
 * // 일반 버튼
 * <AddButton onClick={handleAdd} variant="primary" size="md" />
 *
 * @example
 * // FAB 버튼 (플로팅 스타일)
 * <AddButton onClick={handleAdd} variant="fab" size="md" className="absolute bottom-6 right-6 z-50" />
 */
export const AddButton = ({
    onClick,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    className,
    'aria-label': ariaLabel = '추가',
    isActive = false,
}: AddButtonProps) => {
    const iconSizes = {
        sm: 'w-5 h-5',
        md: 'w-6 h-6',
        lg: 'w-7 h-7',
    };

    const iconSize = iconSizes[size ?? 'md'];

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || isLoading}
            aria-label={isActive ? '닫기' : ariaLabel}
            className={cn(buttonVariants({ variant, size }), className)}
        >
            {isLoading && <span className="animate-spin">⏳</span>}
            {!isLoading && isActive && <IoIosRemove className={iconSize} />}
            {!isLoading && !isActive && <IoIosAdd className={iconSize} />}
        </button>
    );
};
