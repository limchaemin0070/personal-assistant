import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import type { CalendarEvent } from '@/types/calendar';

interface EventTicketFormProps {
    onSubmit: (data: EventTicketFormData) => void | Promise<void>;
    onCancel?: () => void;
    initialDate?: Date;
    initialEvent?: CalendarEvent | null;
    className?: string;
}

export interface EventTicketFormData {
    title: string;
    memo?: string | null;
    start_date: string; // YYYY-MM-DD 형식
    end_date: string; // YYYY-MM-DD 형식
    start_time?: string | null; // HH:mm 형식
    end_time?: string | null; // HH:mm 형식
    is_all_day: boolean;
    notification_enabled: boolean;
}

export const EventTicketForm: React.FC<EventTicketFormProps> = ({
    onSubmit,
    onCancel,
    initialDate,
    initialEvent,
    className,
}) => {
    const defaultDate = initialDate || new Date();
    const defaultStartTime = new Date();
    defaultStartTime.setHours(9, 0, 0, 0); // 기본 시작 시간: 09:00
    const defaultEndTime = new Date();
    defaultEndTime.setHours(10, 0, 0, 0); // 기본 종료 시간: 10:00

    const isEditMode = !!initialEvent;

    // TODO : 추후 훅으로 관리 (수정 시에도 동일하게 이용해야 함)
    // 폼 상태 - 초기 이벤트가 있으면 그 값으로 초기화
    const [title, setTitle] = useState(initialEvent?.title || '');
    const [memo, setMemo] = useState(initialEvent?.memo || '');
    const [startDate, setStartDate] = useState(
        initialEvent
            ? CalendarUtils.getDateKey(initialEvent.startDate)
            : CalendarUtils.getDateKey(defaultDate),
    );
    const [endDate, setEndDate] = useState(
        initialEvent
            ? CalendarUtils.getDateKey(initialEvent.endDate)
            : CalendarUtils.getDateKey(defaultDate),
    );
    const [isAllDay, setIsAllDay] = useState(initialEvent?.isAllDay ?? true);
    const [startTime, setStartTime] = useState(
        initialEvent?.startTime
            ? CalendarUtils.formatTimeDisplay(initialEvent.startTime)
            : CalendarUtils.formatTimeForInput(defaultStartTime),
    );
    const [endTime, setEndTime] = useState(
        initialEvent?.endTime
            ? CalendarUtils.formatTimeDisplay(initialEvent.endTime)
            : CalendarUtils.formatTimeForInput(defaultEndTime),
    );
    const [notificationEnabled, setNotificationEnabled] = useState(
        initialEvent?.notificationEnabled ?? false,
    );

    // initialEvent가 변경되면 폼 상태 업데이트 (외부에서 다른 이벤트로 변경 시)
    useEffect(() => {
        if (initialEvent) {
            const defaultStartTimeForEdit = new Date();
            defaultStartTimeForEdit.setHours(9, 0, 0, 0);
            const defaultEndTimeForEdit = new Date();
            defaultEndTimeForEdit.setHours(10, 0, 0, 0);

            setTitle(initialEvent.title || '');
            setMemo(initialEvent.memo || '');
            setStartDate(CalendarUtils.getDateKey(initialEvent.startDate));
            setEndDate(CalendarUtils.getDateKey(initialEvent.endDate));
            setIsAllDay(initialEvent.isAllDay ?? true);
            setStartTime(
                initialEvent.startTime
                    ? CalendarUtils.formatTimeDisplay(initialEvent.startTime)
                    : CalendarUtils.formatTimeForInput(defaultStartTimeForEdit),
            );
            setEndTime(
                initialEvent.endTime
                    ? CalendarUtils.formatTimeDisplay(initialEvent.endTime)
                    : CalendarUtils.formatTimeForInput(defaultEndTimeForEdit),
            );
            setNotificationEnabled(initialEvent.notificationEnabled ?? false);
        }
    }, [initialEvent]);

    // 에러 상태
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 유효성 검사
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        // 제목 검사
        if (!title.trim()) {
            newErrors.title = '제목을 입력해주세요.';
        } else if (title.length > 255) {
            newErrors.title = '제목은 255자 이하여야 합니다.';
        }

        // 메모 검사
        if (memo.length > 500) {
            newErrors.memo = '메모는 500자 이하여야 합니다.';
        }

        // 날짜 검사
        if (!startDate) {
            newErrors.startDate = '시작 날짜를 선택해주세요.';
        }
        if (!endDate) {
            newErrors.endDate = '종료 날짜를 선택해주세요.';
        }
        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            newErrors.endDate = '종료 날짜는 시작 날짜보다 늦어야 합니다.';
        }

        // 시간 검사 (종일이 아닐 때)
        if (!isAllDay) {
            if (!startTime) {
                newErrors.startTime = '시작 시간을 선택해주세요.';
            }
            if (!endTime) {
                newErrors.endTime = '종료 시간을 선택해주세요.';
            }
            if (startTime && endTime) {
                // 같은 날짜인 경우 시간 비교
                if (startDate === endDate) {
                    const [startHour, startMin] = startTime
                        .split(':')
                        .map(Number);
                    const [endHour, endMin] = endTime.split(':').map(Number);
                    const startMinutes = startHour * 60 + startMin;
                    const endMinutes = endHour * 60 + endMin;

                    if (endMinutes <= startMinutes) {
                        newErrors.endTime =
                            '종료 시간은 시작 시간보다 늦어야 합니다.';
                    }
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 폼 제출 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const formData: EventTicketFormData = {
                title: title.trim(),
                memo: memo.trim() || null,
                start_date: startDate,
                end_date: endDate,
                start_time: isAllDay ? null : startTime,
                end_time: isAllDay ? null : endTime,
                is_all_day: isAllDay,
                notification_enabled: notificationEnabled,
            };

            await onSubmit(formData);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('이벤트 생성 실패:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 종일 체크박스 변경 핸들러
    const handleAllDayChange = (checked: boolean) => {
        setIsAllDay(checked);
        // 종일로 변경하면 시간 에러 제거
        if (checked) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.startTime;
                delete newErrors.endTime;
                return newErrors;
            });
        }
    };

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    e.stopPropagation();
                }
            }}
            role="presentation"
        >
            <form
                onSubmit={handleSubmit}
                className={cn(
                    'flex flex-col gap-4 p-6 bg-white rounded-lg shadow-sm border border-gray-200',
                    className,
                )}
            >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {isEditMode ? '일정 수정' : '새 일정 만들기'}
                </h2>

                {/* 제목 */}
                <div className="input-group">
                    <label
                        htmlFor="title"
                        className="input-label input-label-required"
                    >
                        제목
                        {errors.title && (
                            <span className="block mt-1 text-xs text-red-500">
                                {errors.title}
                            </span>
                        )}
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="일정 제목을 입력하세요"
                            className={cn(
                                'input-base mt-2',
                                errors.title && 'input-error',
                            )}
                            disabled={isSubmitting}
                        />
                    </label>
                </div>

                {/* 메모 */}
                <div className="input-group">
                    <label htmlFor="memo" className="input-label">
                        메모
                        <textarea
                            id="memo"
                            name="memo"
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder="일정에 대한 메모를 입력하세요 (선택사항)"
                            className={cn(
                                'textarea-base mt-2',
                                errors.memo && 'input-error',
                            )}
                            rows={3}
                            maxLength={500}
                            disabled={isSubmitting}
                        />
                        {errors.memo && (
                            <span className="input-error-message">
                                {errors.memo}
                            </span>
                        )}
                        {memo.length > 0 && (
                            <span className="input-help-text">
                                {memo.length} / 500자
                            </span>
                        )}
                    </label>
                </div>

                {/* 날짜 */}
                <div className="grid grid-cols-2 gap-4">
                    {/* 시작 날짜 */}
                    <div className="input-group">
                        <label
                            htmlFor="startDate"
                            className="input-label input-label-required"
                        >
                            시작 날짜
                            <input
                                id="startDate"
                                name="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className={cn(
                                    'input-base mt-2',
                                    errors.startDate && 'input-error',
                                )}
                                disabled={isSubmitting}
                            />
                            {errors.startDate && (
                                <span className="input-error-message">
                                    {errors.startDate}
                                </span>
                            )}
                        </label>
                    </div>

                    {/* 종료 날짜 */}
                    <div className="input-group">
                        <label
                            htmlFor="endDate"
                            className="input-label input-label-required"
                        >
                            종료 날짜
                            <input
                                id="endDate"
                                name="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className={cn(
                                    'input-base mt-2',
                                    errors.endDate && 'input-error',
                                )}
                                min={startDate}
                                disabled={isSubmitting}
                            />
                            {errors.endDate && (
                                <span className="input-error-message">
                                    {errors.endDate}
                                </span>
                            )}
                        </label>
                    </div>
                </div>

                {/* 종일 체크박스 */}
                <div className="flex items-center gap-2">
                    <label
                        htmlFor="isAllDay"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer"
                    >
                        <input
                            id="isAllDay"
                            name="isAllDay"
                            type="checkbox"
                            checked={isAllDay}
                            onChange={(e) =>
                                handleAllDayChange(e.target.checked)
                            }
                            className="checkbox-base"
                            disabled={isSubmitting}
                        />
                        종일
                    </label>
                </div>

                {/* 시간 (종일이 아닐 때만 표시) */}
                {!isAllDay && (
                    <div className="grid grid-cols-2 gap-4">
                        {/* 시작 시간 */}
                        <div className="input-group">
                            <label
                                htmlFor="startTime"
                                className="input-label input-label-required"
                            >
                                시작 시간
                                <input
                                    id="startTime"
                                    name="startTime"
                                    type="time"
                                    value={startTime}
                                    onChange={(e) =>
                                        setStartTime(e.target.value)
                                    }
                                    className={cn(
                                        'input-base mt-2',
                                        errors.startTime && 'input-error',
                                    )}
                                    disabled={isSubmitting}
                                />
                                {errors.startTime && (
                                    <span className="input-error-message">
                                        {errors.startTime}
                                    </span>
                                )}
                            </label>
                        </div>

                        {/* 종료 시간 */}
                        <div className="input-group">
                            <label
                                htmlFor="endTime"
                                className="input-label input-label-required"
                            >
                                종료 시간
                                <input
                                    id="endTime"
                                    name="endTime"
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className={cn(
                                        'input-base mt-2',
                                        errors.endTime && 'input-error',
                                    )}
                                    disabled={isSubmitting}
                                />
                                {errors.endTime && (
                                    <span className="input-error-message">
                                        {errors.endTime}
                                    </span>
                                )}
                            </label>
                        </div>
                    </div>
                )}

                {/* 알림 설정 */}
                <div className="flex items-center gap-2">
                    <label
                        htmlFor="notificationEnabled"
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer"
                    >
                        <input
                            id="notificationEnabled"
                            name="notificationEnabled"
                            type="checkbox"
                            checked={notificationEnabled}
                            onChange={(e) =>
                                setNotificationEnabled(e.target.checked)
                            }
                            className="checkbox-base"
                            disabled={isSubmitting}
                        />
                        알림 설정
                    </label>
                </div>

                {/* 버튼 영역 */}
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn-secondary btn-full"
                            disabled={isSubmitting}
                        >
                            취소
                        </button>
                    )}
                    <button
                        type="submit"
                        className="btn-primary-filled btn-full"
                        disabled={isSubmitting}
                    >
                        {(() => {
                            if (isSubmitting) {
                                return isEditMode ? '수정 중...' : '생성 중...';
                            }
                            return isEditMode ? '수정' : '제출';
                        })()}
                    </button>
                </div>
            </form>
        </div>
    );
};
