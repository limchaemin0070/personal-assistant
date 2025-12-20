import React from 'react';
import { cn } from '@/utils/cn';

interface SidebarProps {
    title: string;
    // eslint-disable-next-line react/require-default-props
    width?: 'sm' | 'md' | 'lg';
    // eslint-disable-next-line react/require-default-props
    borderPosition?: 'left' | 'right';
    // eslint-disable-next-line react/require-default-props
    onClose?: () => void;
    children: React.ReactNode;
    // eslint-disable-next-line react/require-default-props
    headerActions?: React.ReactNode;
    // eslint-disable-next-line react/require-default-props
    showCloseButton?: boolean;
}

const widthMap = {
    sm: 'w-64', // 256px
    md: 'w-72', // 288px
    lg: 'w-80', // 320px
};

const borderMap = {
    left: 'border-l',
    right: 'border-r',
};

export const Sidebar: React.FC<SidebarProps> = ({
    title,
    width = 'md',
    borderPosition = 'right',
    onClose,
    children,
    headerActions,
    showCloseButton = true,
}) => {
    return (
        <aside
            className={cn(
                widthMap[width],
                'shrink-0',
                borderMap[borderPosition],
                'border-gray-200 bg-white',
            )}
        >
            <div className="flex h-full flex-col p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {title}
                    </h2>
                    <div className="flex items-center gap-2">
                        {headerActions}
                        {onClose && showCloseButton && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">{children}</div>
            </div>
        </aside>
    );
};
