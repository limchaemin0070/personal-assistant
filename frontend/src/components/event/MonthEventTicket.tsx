import React from 'react';

/* eslint-disable @typescript-eslint/no-unused-vars */
// MonthEventTicket.tsx
interface MonthEventTicketProps {
    id: number;
    title: string;
    categoryColor?: string; // 카테고리 색상 (책갈피 및 배경색에 사용)

    startDate: Date;
    endDate: Date;

    row: number; // 몇 번째 줄
    span: number; // 며칠간 이어지는지
    isStart: boolean; // 시작일인지
    isEnd?: boolean; // 종료일인지 (옵션)

    isWeekStart: boolean;
    isWeekEnd?: boolean; // 주의 마지막 날인지 (옵션)

    // 호버 이벤트 관련
    isHovered: boolean;
    onHover: (eventId: number | null) => void;

    // 클릭 이벤트 관련
    onClick?: (id: number) => void;
}

export const MonthEventTicket = ({
    id,
    title,
    categoryColor = '#78716c', // 기본 카테고리 색상
    startDate,
    endDate,
    row,
    span,
    isStart,
    isEnd,
    isWeekStart,
    isWeekEnd,
    isHovered,
    onHover,
    onClick,
}: MonthEventTicketProps) => {
    // 향후 사용 예정인 변수들
    const reservedForFutureUse = { startDate, endDate, isEnd };
    // eslint-disable-next-line no-console
    console.log(reservedForFutureUse);

    const handleClick = () => {
        onClick?.(id);
    };

    // 카테고리 색상에 따른 배경색 계산 (연한 색상)
    const getBackgroundColor = (color: string): string => {
        // HEX 색상을 RGB로 변환
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // 연한 배경색 생성 (투명도 적용)
        return `rgba(${r}, ${g}, ${b}, 0.15)`;
    };

    const className = [
        'month-event-ticket',
        isStart && 'is-start',
        isWeekStart && 'is-week-start',
        isWeekEnd && 'is-week-end',
        isHovered && 'is-hovered',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            onMouseEnter={() => onHover(id)}
            onMouseLeave={() => onHover(null)}
            onClick={handleClick}
            className={className}
            style={
                {
                    '--event-ticket-category-color': categoryColor,
                    '--event-ticket-bg-color':
                        getBackgroundColor(categoryColor),
                    gridRow: row + 1,
                    gridColumn: `span ${span}`,
                } as React.CSSProperties
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            }}
        >
            {/* 시작일이거나 or 그 주의 시작(일요일)에 표시되는 이벤트일 경우 제목 표시 */}
            {(isStart || isWeekStart) && (
                <span className="event-title">{title}</span>
            )}
        </div>
    );
};
