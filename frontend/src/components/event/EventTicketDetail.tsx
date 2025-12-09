import React from 'react';
import type { CalendarEvent } from '@/types/calendar';
import { UpdateButton } from '../common/Button/UpdateButton';
import { DeleteButton } from '../common/Button/DeleteButton';
import { CloseButton } from '../common/Button/CloseButton';
import { cn } from '@/utils/cn';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';

interface EventTicketDetailProps {
    event: CalendarEvent;
    onUpdate?: (event: CalendarEvent) => void;
    onDelete?: (eventId: number) => void;
    onClose?: () => void;
    className?: string;
}

/**
 * 일정 상세보기 컴포넌트
 * 모달이나 사이드바에 삽입하여 사용할 수 있습니다.
 *
 * @example
 * <EventTicketDetail
 *   event={selectedEvent}
 *   onUpdate={(event) => console.log('수정', event)}
 *   onDelete={(id) => console.log('삭제', id)}
 * />
 */
export const EventTicketDetail: React.FC<EventTicketDetailProps> = ({
    event,
    onUpdate,
    onDelete,
    onClose,
    className,
}) => {
    // 날짜 범위 표시
    const getDateRange = (): string => {
        const startDateStr = CalendarUtils.formatDateDisplay(event.startDate);
        const endDateStr = CalendarUtils.formatDateDisplay(event.endDate);

        // 같은 날짜인 경우
        if (startDateStr === endDateStr) {
            return startDateStr;
        }

        return `${startDateStr} ~ ${endDateStr}`;
    };

    // 시간 범위 표시
    const getTimeRange = (): string => {
        if (event.isAllDay) {
            return '종일';
        }

        const startTime = CalendarUtils.formatTimeDisplay(event.startTime);
        const endTime = CalendarUtils.formatTimeDisplay(event.endTime);

        if (!startTime && !endTime) {
            return '시간 미정';
        }

        if (startTime && endTime) {
            return `${startTime} ~ ${endTime}`;
        }

        if (startTime) {
            return `${startTime}부터`;
        }

        if (endTime) {
            return `${endTime}까지`;
        }

        return '';
    };

    const handleUpdate = () => {
        onUpdate?.(event);
    };

    const handleDelete = () => {
        onDelete?.(event.id);
    };

    return (
        <div
            className={cn(
                'flex flex-col gap-4 p-6 bg-white rounded-lg',
                className,
            )}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                }
            }}
            role="presentation"
        >
            {/* 헤더 영역 */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    {/* 제목 */}
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 wrap-break-word">
                        {event.title}
                    </h2>

                    {/* 카테고리 색상 표시 (있는 경우) */}
                    {event.categoryColor && (
                        <div
                            className="w-4 h-4 rounded-full mb-2"
                            style={{ backgroundColor: event.categoryColor }}
                            aria-label="카테고리 색상"
                        />
                    )}
                </div>

                {/* 액션 버튼 영역 */}
                <div className="flex gap-2 shrink-0">
                    {onUpdate && (
                        <UpdateButton
                            onClick={handleUpdate}
                            size="md"
                            aria-label="일정 수정"
                        />
                    )}
                    {onDelete && (
                        <DeleteButton
                            onClick={handleDelete}
                            size="md"
                            aria-label="일정 삭제"
                        />
                    )}
                    {onClose && (
                        <CloseButton
                            onClick={onClose}
                            variant="secondary"
                            size="lg"
                            aria-label="닫기"
                        />
                    )}
                </div>
            </div>

            {/* 날짜/시간 정보 */}
            <div className="flex flex-col gap-3">
                {/* 날짜 */}
                <div className="flex items-start gap-3">
                    <span className="text-sm font-medium text-gray-500 min-w-[60px]">
                        날짜
                    </span>
                    <span className="text-sm text-gray-900">
                        {getDateRange()}
                    </span>
                </div>

                {/* 시간 */}
                <div className="flex items-start gap-3">
                    <span className="text-sm font-medium text-gray-500 min-w-[60px]">
                        시간
                    </span>
                    <span className="text-sm text-gray-900">
                        {getTimeRange()}
                    </span>
                </div>

                {/* 알림 설정 */}
                {event.notificationEnabled !== undefined && (
                    <div className="flex items-start gap-3">
                        <span className="text-sm font-medium text-gray-500 min-w-[60px]">
                            알림
                        </span>
                        <span className="text-sm text-gray-900">
                            {event.notificationEnabled
                                ? '설정됨'
                                : '설정 안 됨'}
                        </span>
                    </div>
                )}
            </div>

            {/* 메모 */}
            {event.memo && (
                <div className="flex flex-col gap-2 pt-3 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-500">
                        메모
                    </span>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap wrap-break-word">
                        {event.memo}
                    </p>
                </div>
            )}

            {/* 생성/수정 시간 (선택적) */}
            {(event.createdAt || event.updatedAt) && (
                <div className="flex flex-col gap-1 pt-3 border-t border-gray-200">
                    {event.createdAt && (
                        <span className="text-xs text-gray-400">
                            생성일:{' '}
                            {new Date(event.createdAt).toLocaleString('ko-KR')}
                        </span>
                    )}
                    {event.updatedAt && (
                        <span className="text-xs text-gray-400">
                            수정일:{' '}
                            {new Date(event.updatedAt).toLocaleString('ko-KR')}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};
