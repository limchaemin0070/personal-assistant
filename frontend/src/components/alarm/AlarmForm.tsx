import React from 'react';
import { FormProvider } from 'react-hook-form';
import { cn } from '@/utils/cn';
import { FormInput, FormTime } from '../common/Form/input';
import type { AlarmFormData } from '@/schemas/alarmSchema';
import { AlarmDateSection } from './sections/AlarmDateSection';
import { useAlarmForm } from '@/hooks/alarm/useAlarmForm';
import { useCreateAlarm } from '@/hooks/alarm/useCreateAlarm';
import { useUpdateAlarm } from '@/hooks/alarm/useUpdateAlarm';
import type { Alarm } from '@/types/alarm';

interface AlarmFormProps {
    onSubmit: () => void;
    onCancel?: () => void;
    initialDate?: Date;
    initialAlarm?: Alarm | null;
    className?: string;
}

export const AlarmForm: React.FC<AlarmFormProps> = ({
    onSubmit,
    onCancel,
    initialDate,
    initialAlarm,
    className,
}) => {
    const createAlarm = useCreateAlarm();
    const updateAlarm = useUpdateAlarm();

    const isEditMode = !!initialAlarm;

    const form = useAlarmForm({
        initialAlarm,
        initialDate,
    });

    const handleSubmit = form.handleSubmit(async (formData: AlarmFormData) => {
        try {
            if (isEditMode) {
                await updateAlarm.mutateAsync({
                    alarmId: initialAlarm.id,
                    formData,
                });
            } else {
                await createAlarm.mutateAsync(formData);
            }
            // handleCancel - 제출한 다음 제출모달 닫음
            onSubmit?.();
        } catch (error) {
            // TODO : 콘솔 제거
            // eslint-disable-next-line no-console
            console.error('알람 저장 실패:', error);
            // form.setError('root', {
            //     type: 'manual',
            //     message: '알람 저장에 실패했습니다.',
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
                    className={cn('flex flex-col gap-2 p-2', className)}
                >
                    <h2 className="text-md font-semibold text-gray-900 mb-2">
                        {isEditMode ? '알람 수정' : '새 알람'}
                    </h2>
                    <div className="space-y-2">
                        <FormTime name="time" />
                        <AlarmDateSection />
                        <FormInput
                            name="title"
                            placeholder="알람 이름"
                            required
                            maxLength={255}
                            disabled={form.formState.isSubmitting}
                            className="p-3 border-none"
                        />
                        {form.formState.errors.root && (
                            <div className="text-sm text-red-500">
                                {form.formState.errors.root.message}
                            </div>
                        )}
                        <div className="flex gap-2 pt-2">
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
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
