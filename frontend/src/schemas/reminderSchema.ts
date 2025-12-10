// schemas/reminderSchema.ts
import { z } from 'zod';

export const reminderFormSchema = z
    .object({
        title: z
            .string()
            .min(1, '제목을 입력해주세요.')
            .max(255, '제목은 255자 이하여야 합니다.'),

        memo: z
            .string()
            .max(500, '메모는 500자 이하여야 합니다.')
            .optional()
            .or(z.literal('')),

        date: z.string().nullable().optional(),

        time: z.string().nullable().optional(),

        is_all_day: z.boolean(),

        notification_enabled: z.boolean(),
    })
    // 종일이 아닐 때 시간 필수
    .refine(
        (data) => {
            if (!data.is_all_day) {
                return !!data.time;
            }
            return true;
        },
        {
            message: '종일이 아닌 경우 시간을 선택해주세요.',
            path: ['time'],
        },
    )
    // 알림이 활성화된 경우 날짜 필수
    .refine(
        (data) => {
            if (data.notification_enabled) {
                return !!data.date;
            }
            return true;
        },
        {
            message: '알림을 활성화하려면 날짜를 선택해주세요.',
            path: ['date'],
        },
    );

export type ReminderFormData = z.infer<typeof reminderFormSchema>;
