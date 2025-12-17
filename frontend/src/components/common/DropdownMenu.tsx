import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

export interface DropdownMenuItem<T = string> {
    value: T;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    divider?: boolean; // 구분선 표시
    onClick?: (value: T) => void;
}

interface DropdownMenuProps<T = string> {
    items: DropdownMenuItem<T>[];
    trigger: React.ReactNode; // 버튼 내용
    align?: 'left' | 'right';
    className?: string;
    menuClassName?: string;
    onItemClick?: (value: T) => void;
    closeOnClick?: boolean; // 아이템 클릭 시 자동 닫기
}

export const DropdownMenu = <T extends string | number = string>({
    items,
    trigger,
    align = 'right',
    className,
    menuClassName,
    onItemClick,
    closeOnClick = true,
}: DropdownMenuProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleItemClick = (item: DropdownMenuItem<T>) => {
        if (item.disabled) return;

        if (item.onClick) {
            item.onClick(item.value);
        }

        if (onItemClick) {
            onItemClick(item.value);
        }

        if (closeOnClick) {
            setIsOpen(false);
        }
    };

    return (
        <div
            ref={dropdownRef}
            className={cn('relative inline-block', className)}
        >
            {/* 트리거 버튼 */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                role="button"
                tabIndex={0}
                aria-haspopup="true"
                aria-expanded={isOpen}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                    }
                }}
            >
                {trigger}
            </div>

            {/* 드롭다운 메뉴 */}
            {isOpen && (
                <div
                    role="menu"
                    className={cn(
                        'absolute z-50 mt-1 min-w-[160px] rounded-md bg-white shadow-lg',
                        'border border-gray-200 py-1',
                        'focus:outline-none',
                        align === 'right' ? 'right-0' : 'left-0',
                        menuClassName,
                    )}
                >
                    {items.map((item, index) => {
                        if (item.divider) {
                            const prevValue =
                                index > 0
                                    ? String(items[index - 1]?.value || '')
                                    : 'start';
                            const nextValue =
                                index < items.length - 1
                                    ? String(items[index + 1]?.value || '')
                                    : 'end';
                            return (
                                <div
                                    key={`divider-${prevValue}-${nextValue}`}
                                    className="my-1 h-px bg-gray-200"
                                    role="separator"
                                />
                            );
                        }

                        return (
                            <button
                                key={String(item.value)}
                                type="button"
                                role="menuitem"
                                data-item-index={index}
                                disabled={item.disabled}
                                onClick={() => handleItemClick(item)}
                                className={cn(
                                    'w-full px-4 py-2 text-left text-sm',
                                    'flex items-center gap-2',
                                    'transition-colors duration-150',
                                    item.disabled
                                        ? 'cursor-not-allowed text-gray-400'
                                        : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
                                )}
                            >
                                {item.icon && (
                                    <span className="shrink-0">
                                        {item.icon}
                                    </span>
                                )}
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
