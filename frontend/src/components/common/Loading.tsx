import React from 'react';

interface LoadingProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'blue' | 'gray' | 'red' | 'green' | 'purple';
    fullScreen?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
};

const colorClasses = {
    blue: 'border-blue-500 border-t-transparent',
    gray: 'border-gray-500 border-t-transparent',
    red: 'border-red-500 border-t-transparent',
    green: 'border-green-500 border-t-transparent',
    purple: 'border-purple-500 border-t-transparent',
};

export const Loading: React.FC<LoadingProps> = ({
    size = 'md',
    color = 'blue',
    fullScreen = false,
    className = '',
}: LoadingProps) => {
    const spinner = (
        <div
            className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center w-full h-full bg-black/10 z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};
