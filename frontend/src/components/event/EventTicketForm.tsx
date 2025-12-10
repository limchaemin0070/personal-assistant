import React from 'react';
import { FormProvider } from 'react-hook-form';
import { cn } from '@/utils/cn';
import type { CalendarEvent } from '@/types/calendar';
import { useEventForm } from '@/hooks/event/useEventForm';
import { FormCheckbox, FormInput, FormTextArea } from '../common/Form/input';
import { EventDateTimeSection } from './sections/EventDateTimeSection';
import { useCreateEvent } from '@/hooks/event/useCreateEvent';
import { useUpdateEvent } from '@/hooks/event/useUpdateEvent';

interface EventTicketFormProps {
    onSubmit: () => void;
    onCancel?: () => void;
    initialDate?: Date;
    initialEvent?: CalendarEvent | null;
    className?: string;
}

export const EventTicketForm: React.FC<EventTicketFormProps> = ({
    onSubmit,
    onCancel,
    initialDate,
    initialEvent,
    className,
}) => {
    const createEvent = useCreateEvent();
    const updateEvent = useUpdateEvent();

    const isEditMode = !!initialEvent;

    const form = useEventForm({
        initialEvent,
        initialDate,
    });

    const handleSubmit = form.handleSubmit(async (formData) => {
        try {
            if (isEditMode) {
                await updateEvent.mutateAsync({
                    eventId: initialEvent.id,
                    formData,
                });
            } else {
                await createEvent.mutateAsync(formData);
            }
            // handleCancel - 제출한 다음 제출모달 닫음
            onSubmit?.();
        } catch (error) {
            // TODO : 콘솔 제거
            // eslint-disable-next-line no-console
            console.error('일정 저장 실패:', error);
            // form.setError('root', {
            //     type: 'manual',
            //     message: '일정 저장에 실패했습니다.',
            // });
        }
    });

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
            <FormProvider {...form}>
                <form
                    onSubmit={handleSubmit}
                    className={cn(
                        'flex flex-col gap-4 p-6 bg-white rounded-lg',
                        className,
                    )}
                >
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {isEditMode ? '일정 수정' : '새 일정 만들기'}
                    </h2>

                    {/* 제목 */}
                    <FormInput
                        name="title"
                        label="제목"
                        placeholder="일정 제목을 입력하세요"
                        required
                        maxLength={255}
                        disabled={form.formState.isSubmitting}
                    />

                    {/* 메모 */}
                    <FormTextArea
                        name="memo"
                        label="메모"
                        placeholder="일정에 대한 메모를 입력하세요 (선택사항)"
                        rows={3}
                        maxLength={500}
                        showCharCount
                        disabled={form.formState.isSubmitting}
                    />

                    {/* 날짜/시간 */}
                    <EventDateTimeSection />

                    {/* 알림 설정 */}
                    <FormCheckbox
                        name="notification_enabled"
                        label="알림 설정"
                        disabled={form.formState.isSubmitting}
                    />

                    {/* Root 에러 */}
                    {form.formState.errors.root && (
                        <div className="text-sm text-red-500">
                            {form.formState.errors.root.message}
                        </div>
                    )}

                    {/* 버튼 영역 */}
                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="btn-secondary btn-full"
                                disabled={form.formState.isSubmitting}
                            >
                                취소
                            </button>
                        )}
                        <button
                            type="submit"
                            className="btn-primary-filled btn-full"
                            disabled={form.formState.isSubmitting}
                        >
                            {(() => {
                                if (form.formState.isSubmitting) {
                                    return isEditMode
                                        ? '수정 중...'
                                        : '생성 중...';
                                }
                                return isEditMode ? '수정' : '제출';
                            })()}
                        </button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
