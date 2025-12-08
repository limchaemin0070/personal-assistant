import React from 'react';
import type { CalendarEvent } from '@/types/calendar';
import { UpdateButton } from '../common/Button/UpdateButton';
import { DeleteButton } from '../common/Button/DeleteButton';
import { cn } from '@/utils/cn';

interface EventTicketDetailProps {
    event: CalendarEvent;
    onUpdate?: (event: CalendarEvent) => void;
    onDelete?: (eventId: string | number) => void;
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
    className,
}) => {
    // TODO : 로직 분리
    // 날짜 포맷팅 함수 -> utils
    // 날짜 포맷팅 함수
    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    };

    // 시간 포맷팅 함수 (HH:mm 형식)
    const formatTime = (time: string | null | undefined): string => {
        if (!time) return '';
        // "HH:mm:ss" 형식이면 "HH:mm"만 추출
        return time.substring(0, 5);
    };

    // 날짜 범위 표시
    const getDateRange = (): string => {
        const startDateStr = formatDate(event.startDate);
        const endDateStr = formatDate(event.endDate);

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

        const startTime = formatTime(event.startTime);
        const endTime = formatTime(event.endTime);

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
        // eslint-disable-next-line no-alert
        if (window.confirm('정말 이 일정을 삭제하시겠습니까?')) {
            onDelete?.(event.id);
        }
    };

    return (
        <div
            className={cn(
                'flex flex-col gap-4 p-6 bg-white rounded-lg shadow-sm border border-gray-200',
                className,
            )}
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
                            variant="primary"
                            size="md"
                            aria-label="일정 수정"
                        />
                    )}
                    {onDelete && (
                        <DeleteButton
                            onClick={handleDelete}
                            variant="danger"
                            size="md"
                            aria-label="일정 삭제"
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
