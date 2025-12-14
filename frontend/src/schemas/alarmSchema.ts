// schemas/alarmSchema.ts
import { z } from 'zod';

export const alarmFormSchema = z.object({
    title: z
        .string()
        .min(1, '알람 이름을 입력해주세요.')
        .max(255, '알람 이름은 255자 이하여야 합니다.'),
    time: z.string().min(1, '시간을 선택해주세요.'),
    date: z.string().nullable().optional(),
    repeat_days: z.array(z.number()),
});

export type AlarmFormData = z.infer<typeof alarmFormSchema>;

