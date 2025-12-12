import React from 'react';
import type { CalendarView } from '@/types/calendar';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';

/* eslint-disable @typescript-eslint/no-unused-vars */
// MonthEventTicket.tsx
interface MonthEventTicketProps {
    id: number;
    title: string;
    categoryColor?: string; // 카테고리 색상 (책갈피 및 배경색에 사용)

    startDate: Date;
    endDate: Date;
    startTime?: string | null; // "HH:mm" 형식
    endTime?: string | null; // "HH:mm" 형식
    isAllDay?: boolean; // 종일 여부

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

    // 뷰 타입별 스타일
    viewType?: CalendarView; // 'month' | 'week' | 'day'
}

export const MonthEventTicket = ({
    id,
    title,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    categoryColor: _categoryColor, // 카테고리 색상 (향후 카테고리 기능 추가 시 사용 예정)
    startDate: _startDate,
    endDate: _endDate,
    startTime,
    endTime,
    isAllDay = false,
    row,
    span,
    isStart,
    isEnd: _isEnd,
    isWeekStart,
    isWeekEnd,
    isHovered,
    onHover,
    onClick,
    viewType = 'month', // 기본값은 'month'
}: MonthEventTicketProps) => {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick?.(id);
    };

    const className = [
        'month-event-ticket',
        `month-event-ticket-${viewType}`, // 뷰 타입별 클래스 추가
        isStart && 'is-start',
        isWeekStart && 'is-week-start',
        isWeekEnd && 'is-week-end',
        isHovered && 'is-hovered',
    ]
        .filter(Boolean)
        .join(' ');

    // 뷰 타입별 시간 포맷팅 (일간 뷰에서만 좌측 시간 표시)
    const renderTimeDisplay = () => {
        if (viewType === 'day') {
            // 일간 뷰: 시작시간 표시
            if (isAllDay) {
                return <span className="event-time">종일</span>;
            }
            const formattedStartTime =
                CalendarUtils.formatTimeDisplay(startTime);
            return (
                <span className="event-time">
                    {formattedStartTime || '시간 미정'}
                </span>
            );
        }
        return null;
    };

    // 뷰 타입별 내용 렌더링
    const renderContent = () => {
        if (viewType === 'day') {
            // 일간 뷰: 시간과 제목을 가로로 배치
            return (
                <div className="event-content-day">
                    {renderTimeDisplay()}
                    <div>
                        <span className="event-title">{title}</span>
                        <span className="event-time">
                            {CalendarUtils.formatEventTimeRange(
                                isAllDay,
                                startTime,
                                endTime,
                            )}
                        </span>
                    </div>
                </div>
            );
        }
        if (viewType === 'week') {
            // 주간 뷰: 제목과 시간 범위만 표시 (좌측 시간 표시 없음)
            return (
                <div className="event-content-day">
                    <div>
                        <span className="event-title">{title}</span>
                        <span className="event-time">
                            {CalendarUtils.formatEventTimeRange(
                                isAllDay,
                                startTime,
                                endTime,
                            )}
                        </span>
                    </div>
                </div>
            );
        }
        // 월간 뷰: 기존 로직 유지
        if (isStart || isWeekStart) {
            return <span className="event-title">{title}</span>;
        }
        return null;
    };

    return (
        <div
            onMouseEnter={() => onHover(id)}
            onMouseLeave={() => onHover(null)}
            onClick={handleClick}
            className={className}
            style={
                {
                    gridRow:
                        viewType === 'day' || viewType === 'week'
                            ? undefined
                            : row + 1,
                    gridColumn:
                        viewType === 'day' || viewType === 'week'
                            ? undefined
                            : `span ${span}`,
                } as React.CSSProperties
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onClick?.(id);
                }
            }}
        >
            {renderContent()}
        </div>
    );
};
