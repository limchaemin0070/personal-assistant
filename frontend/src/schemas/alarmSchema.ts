// schemas/alarmSchema.ts
import { z } from 'zod';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';

export const alarmFormSchema = z
    .object({
        title: z
            .string()
            .max(255, '알람 이름은 255자 이하여야 합니다.')
            .optional()
            .or(z.literal('')),
        time: z.string().min(1, '시간을 선택해주세요.'),
        date: z.string().nullable().optional(),
        repeat_days: z.array(z.number()),
    })
    .refine(
        (data) => {
            // repeat_days가 있으면 반복 알람이므로 날짜 검증 불필요
            if (data.repeat_days && data.repeat_days.length > 0) {
                return true;
            }
            // date가 없으면 검증 불필요
            if (!data.date) {
                return true;
            }
            // date가 오늘 이후인지 확인
            const today = CalendarUtils.getDateKey(new Date());
            return data.date >= today;
        },
        {
            message: '과거 날짜의 알람은 생성할 수 없습니다.',
            path: ['date'],
        },
    );

export type AlarmFormData = z.infer<typeof alarmFormSchema>;
