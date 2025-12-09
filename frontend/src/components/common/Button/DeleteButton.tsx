// TODO: 리액트 아이콘은 이후 매핑 예정
import type { VariantProps } from 'class-variance-authority';
import { MdDeleteOutline } from 'react-icons/md';
import { buttonVariants } from './Button.style';
import { cn } from '@/utils/cn';

interface DeleteButtonProps extends VariantProps<typeof buttonVariants> {
    onClick: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
    'aria-label'?: string;
}

/**
 * 삭제 버튼
 * 일정/리마인더/알람 삭제 등 기능에서 공통 사용
 *
 * @example
 * // 일반 버튼
 * <DeleteButton onClick={handleDelete} variant="danger" size="md" />
 *
 * @example
 * // FAB 버튼 (플로팅 스타일)
 * <DeleteButton onClick={handleDelete} variant="fab" size="md" className="absolute bottom-6 right-6 z-50" />
 */
export const DeleteButton = ({
    onClick,
    variant = 'secondary',
    size = 'md',
    isLoading = false,
    disabled = false,
    className,
    'aria-label': ariaLabel = '삭제',
}: DeleteButtonProps) => {
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
            className={cn(
                buttonVariants({ variant, size }),
                'hover:text-red-500',
                className,
            )}
        >
            {isLoading ? (
                <span className="animate-spin">⏳</span>
            ) : (
                <MdDeleteOutline className={iconSize} />
            )}
        </button>
    );
};
