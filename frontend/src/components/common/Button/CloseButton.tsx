import { IoIosClose } from 'react-icons/io';
import type { VariantProps } from 'class-variance-authority';
import { buttonVariants } from './Button.style';
import { cn } from '@/utils/cn';

interface CloseButtonProps extends VariantProps<typeof buttonVariants> {
    onClick: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
    'aria-label'?: string;
}

/**
 * 닫기 버튼
 * 모달이나 사이드바에서 공통 사용
 *
 * @example
 * // 일반 버튼
 * <CloseButton onClick={handleClose} variant="secondary" size="md" />
 *
 * @example
 * // 모달 헤더에 배치
 * <CloseButton onClick={handleClose} variant="secondary" size="sm" className="absolute top-4 right-4" />
 */
export const CloseButton = ({
    onClick,
    variant = 'secondary',
    size = 'md',
    isLoading = false,
    disabled = false,
    className,
    'aria-label': ariaLabel = '닫기',
}: CloseButtonProps) => {
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
                'rounded-md hover:bg-gray-100',
                className,
            )}
        >
            {isLoading ? (
                <span className="animate-spin">⏳</span>
            ) : (
                <IoIosClose className={iconSize} />
            )}
        </button>
    );
};
