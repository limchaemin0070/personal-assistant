import React, { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { cn } from '@/utils/cn';
import { useReminderForm } from '@/hooks/reminder/useReminderForm';
import {
    FormCheckbox,
    FormDate,
    FormInput,
    FormTime,
} from '../common/Form/input';
import { useCreateReminder } from '@/hooks/reminder/useCreateReminder';
import { useUpdateReminder } from '@/hooks/reminder/useUpdateReminder';
import type { ReminderFormData } from '@/schemas/reminderSchema';
import type { Reminder } from '@/types/reminder';
import { ReminderDateTimeSection } from './sections/ReminderDateTimeSection';

interface ReminderFormProps {
    onSubmit: () => void;
    onCancel?: () => void;
    initialDate?: Date;
    initialReminder?: Reminder | null;
    className?: string;
}

/**
 * 리마인더 생성 폼 컴포넌트
 * 단일 날짜 (선택) / 단일 시간 (선택)
 * 날짜와 시간은 선택하지 않을 경우 기본적으로 오늘 / 종일로 설정
 * @param param0
 * @returns
 */
export const ReminderForm: React.FC<ReminderFormProps> = ({
    onSubmit,
    onCancel,
    initialDate,
    initialReminder,
    className,
}) => {
    const createReminder = useCreateReminder();
    const updateReminder = useUpdateReminder();

    const isEditMode = !!initialReminder;

    const form = useReminderForm({
        initialReminder,
        initialDate,
    });

    const handleSubmit = form.handleSubmit(
        async (formData: ReminderFormData) => {
            try {
                if (isEditMode) {
                    await updateReminder.mutateAsync({
                        reminderId: initialReminder.id,
                        formData,
                    });
                } else {
                    await createReminder.mutateAsync(formData);
                }
                // handleCancel - 제출한 다음 제출모달 닫음
                onSubmit?.();
            } catch (error) {
                // TODO : 콘솔 제거
                // eslint-disable-next-line no-console
                console.error('리마인더 저장 실패:', error);
                // form.setError('root', {
                //     type: 'manual',
                //     message: '리마인더 저장에 실패했습니다.',
                // });
            }
        },
    );

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
                    className={cn('flex flex-col gap-4 p-2', className)}
                >
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {isEditMode ? '리마인더 수정' : '새 리마인더'}
                    </h2>
                    {/* 제목 */}
                    <FormInput
                        name="title"
                        placeholder="제목을 입력하세요"
                        required
                        maxLength={255}
                        disabled={form.formState.isSubmitting}
                    />

                    {/* 날짜/시간 섹션 */}
                    <ReminderDateTimeSection />

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
