// schemas/eventSchema.ts
import { z } from 'zod';

export const eventFormSchema = z
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

        start_date: z.string().min(1, '시작 날짜를 선택해주세요.'),

        end_date: z.string().min(1, '종료 날짜를 선택해주세요.'),

        is_all_day: z.boolean(),

        start_time: z.string().nullable(),

        end_time: z.string().nullable(),

        notification_enabled: z.boolean(),
    })
    // 날짜 검증
    .refine(
        (data) => {
            const startDate = new Date(data.start_date);
            const endDate = new Date(data.end_date);
            return endDate >= startDate;
        },
        {
            message: '종료 날짜는 시작 날짜보다 늦어야 합니다.',
            path: ['end_date'],
        },
    )
    // 종일이 아닐 때 시간 필수
    .refine(
        (data) => {
            if (!data.is_all_day) {
                return !!data.start_time && !!data.end_time;
            }
            return true;
        },
        {
            message: '시작 시간을 선택해주세요.',
            path: ['start_time'],
        },
    )
    // 같은 날짜일 때 시간 비교
    .refine(
        (data) => {
            if (!data.is_all_day && data.start_date === data.end_date) {
                if (!data.start_time || !data.end_time) return true;

                const [startHour, startMin] = data.start_time
                    .split(':')
                    .map(Number);
                const [endHour, endMin] = data.end_time.split(':').map(Number);
                const startMinutes = startHour * 60 + startMin;
                const endMinutes = endHour * 60 + endMin;

                return endMinutes > startMinutes;
            }
            return true;
        },
        {
            message: '종료 시간은 시작 시간보다 늦어야 합니다.',
            path: ['end_time'],
        },
    );

export type EventFormData = z.infer<typeof eventFormSchema>;
