// TODO: 리액트 아이콘은 이후 매핑 예정
import { IoIosCreate } from 'react-icons/io';
import type { VariantProps } from 'class-variance-authority';
import { buttonVariants } from './Button.style';
import { cn } from '@/utils/cn';

interface UpdateButtonProps extends VariantProps<typeof buttonVariants> {
    onClick: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
    'aria-label'?: string;
}

/**
 * 수정 버튼
 * 일정/리마인더/알람 수정 등 기능에서 공통 사용
 *
 * @example
 * // 일반 버튼
 * <UpdateButton onClick={handleUpdate} variant="primary" size="md" />
 *
 * @example
 * // FAB 버튼 (플로팅 스타일)
 * <UpdateButton onClick={handleUpdate} variant="fab" size="md" className="absolute bottom-6 right-6 z-50" />
 */
export const UpdateButton = ({
    onClick,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    className,
    'aria-label': ariaLabel = '수정',
}: UpdateButtonProps) => {
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
            aria-label={ariaLabel}
            className={cn(buttonVariants({ variant, size }), className)}
        >
            {isLoading ? (
                <span className="animate-spin">⏳</span>
            ) : (
                <IoIosCreate className={iconSize} />
            )}
        </button>
    );
};
