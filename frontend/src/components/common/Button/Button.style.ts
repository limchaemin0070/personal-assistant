import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
    [
        'cursor-pointer',
        'transition-all duration-200',
        // 'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
    ],
    {
        variants: {
            variant: {
                primary: [
                    'text-blue-500',
                    'hover:text-blue-600',
                    'hover:opacity-80 hover:scale-110',
                    'active:scale-95',
                    'focus:ring-blue-500',
                ],
                secondary: [
                    'text-gray-500',
                    'hover:text-gray-600',
                    'hover:opacity-80 hover:scale-110',
                    'active:scale-95',
                    'focus:ring-gray-500',
                ],
                danger: [
                    'text-red-500',
                    'hover:text-red-600',
                    'hover:opacity-80 hover:scale-110',
                    'active:scale-95',
                    'focus:ring-red-500',
                ],
                outline: [
                    'text-blue-500',
                    'border border-blue-500 rounded-full',
                    'hover:bg-blue-50',
                    'hover:scale-110',
                    'active:scale-95',
                    'focus:ring-blue-500',
                ],
                fab: [
                    'rounded-full',
                    'bg-blue-500 text-white',
                    'shadow-lg hover:shadow-xl',
                    'hover:bg-blue-600',
                    'active:scale-95',
                    'flex items-center justify-center',
                    'disabled:hover:scale-100',
                ],
            },
            size: {
                sm: 'text-xl',
                md: 'text-2xl',
                lg: 'text-3xl',
            },
        },
        compoundVariants: [
            {
                variant: 'fab',
                size: 'sm',
                class: 'h-12 w-12',
            },
            {
                variant: 'fab',
                size: 'md',
                class: 'h-14 w-14',
            },
            {
                variant: 'fab',
                size: 'lg',
                class: 'h-16 w-16',
            },
        ],
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    },
);
