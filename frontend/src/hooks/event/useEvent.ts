import { useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarService } from '@/services/calendar.service';
import { useToastStore } from '@/hooks/useToastStore';
import type { EventTicketFormData } from '@/components/event/EventTicketForm';

// 데이터 레이어 (API 호출)
export const useCreateEvent = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();

    return useMutation({
        mutationFn: (formData: EventTicketFormData) =>
            calendarService.createSchedule(formData),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events', 'user'] });
            addToast('일정이 생성되었습니다.', 'success');
        },

        onError: () => {
            addToast('일정 생성에 실패했습니다.', 'error');
        },
    });
};

export const useUpdateEvent = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();

    return useMutation({
        mutationFn: ({
            eventId,
            formData,
        }: {
            eventId: number;
            formData: EventTicketFormData;
        }) => calendarService.updateSchedule(eventId, formData),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events', 'user'] });
            addToast('일정이 수정되었습니다.', 'success');
        },

        onError: () => {
            addToast('일정 수정에 실패했습니다.', 'error');
        },
    });
};

export const useDeleteEvent = () => {
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();

    return useMutation({
        mutationFn: (eventId: number) =>
            calendarService.deleteSchedule(eventId),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events', 'user'] });
            addToast('일정이 삭제되었습니다.', 'success');
        },

        onError: () => {
            addToast('일정 삭제에 실패했습니다.', 'error');
        },
    });
};
