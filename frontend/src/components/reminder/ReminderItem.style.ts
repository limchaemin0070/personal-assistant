import { cva } from 'class-variance-authority';

/**
 * 리마인더 아이템의 스타일 variants
 * 완료/미완료 상태에 따라 다른 스타일 적용
 */
export const reminderItemVariants = cva(
    [
        'flex',
        'items-center',
        'px-4',
        'py-3',
        'text-sm',
        'cursor-pointer',
        'transition-colors',
        'duration-200',
        'rounded-md',
    ],
    {
        variants: {
            status: {
                completed: ['bg-gray-50', 'hover:bg-gray-100', 'opacity-75'],
                incomplete: ['bg-stone-50', 'hover:bg-stone-200'],
            },
        },
        defaultVariants: {
            status: 'incomplete',
        },
    },
);

/**
 * 리마인더 제목 스타일 variants
 */
export const reminderTitleVariants = cva(
    [
        'font-medium',
        'transition-colors',
        'duration-200',
        'block',
        'truncate',
        'w-full',
    ],
    {
        variants: {
            status: {
                completed: ['text-gray-500', 'line-through'],
                incomplete: ['text-gray-900'],
            },
        },
        defaultVariants: {
            status: 'incomplete',
        },
    },
);

/**
 * 리마인더 시간 스타일 variants
 */
export const reminderTimeVariants = cva(
    ['text-xs', 'transition-colors', 'duration-200'],
    {
        variants: {
            status: {
                completed: ['text-gray-400'],
                incomplete: ['text-gray-600'],
            },
        },
        defaultVariants: {
            status: 'incomplete',
        },
    },
);
