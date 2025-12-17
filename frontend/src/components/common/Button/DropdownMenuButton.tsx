import type { VariantProps } from 'class-variance-authority';
import { buttonVariants } from './Button.style';
import {
    DropdownMenu,
    type DropdownMenuItem,
} from '@/components/common/DropdownMenu';
import { cn } from '@/utils/cn';

interface DropdownMenuButtonProps<T = string>
    extends VariantProps<typeof buttonVariants> {
    items: DropdownMenuItem<T>[];
    label?: string;
    icon?: React.ReactNode;
    align?: 'left' | 'right';
    className?: string;
    menuClassName?: string;
    onItemClick?: (value: T) => void;
    closeOnClick?: boolean;
    disabled?: boolean;
    'aria-label'?: string;
}

/**
 * 드롭다운 메뉴 버튼 컴포넌트
 * DropdownMenu를 사용하여 버튼 스타일의 드롭다운 메뉴를 제공
 *
 * @example
 * <DropdownMenuButton
 *   items={[
 *     { value: 'edit', label: '수정', icon: <EditIcon /> },
 *     { value: 'delete', label: '삭제', icon: <DeleteIcon />, divider: true },
 *   ]}
 *   variant="primary"
 *   size="md"
 *   onItemClick={(value) => console.log(value)}
 * />
 *
 * @example
 * // 아이콘과 라벨 함께 사용
 * <DropdownMenuButton
 *   items={menuItems}
 *   icon={<MenuIcon />}
 *   label="메뉴"
 *   variant="outline"
 * />
 */
export const DropdownMenuButton = <T extends string | number = string>({
    items,
    label,
    icon,
    variant = 'primary',
    size = 'md',
    align = 'right',
    className,
    menuClassName,
    onItemClick,
    closeOnClick = true,
    disabled = false,
    'aria-label': ariaLabel = '메뉴',
}: DropdownMenuButtonProps<T>) => {
    const trigger = (
        <button
            type="button"
            disabled={disabled}
            aria-label={ariaLabel}
            className={cn(
                buttonVariants({ variant, size }),
                'flex items-center gap-2',
                disabled && 'opacity-50 cursor-not-allowed',
                className,
            )}
        >
            {icon && <span className="shrink-0">{icon}</span>}
            {label && <span>{label}</span>}
            {!icon && !label && (
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                </svg>
            )}
        </button>
    );

    return (
        <DropdownMenu
            items={items}
            trigger={trigger}
            align={align}
            menuClassName={menuClassName}
            onItemClick={onItemClick}
            closeOnClick={closeOnClick}
        />
    );
};
