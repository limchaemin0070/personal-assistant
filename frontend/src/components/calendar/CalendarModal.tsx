import { useDeleteEvent } from '@/hooks/event/useDeleteEvent';
import type { useEventTicketHandling } from '@/hooks/event/useEventTicketHandling';
import type { CalendarEvent } from '@/types';
import { Modal } from '../common/Modal/Modal';
import { EventTicketDetail } from '../event/EventTicketDetail';
import { EventTicketForm } from '../event/EventTicketForm';

interface CalendarModalsProps {
    currentDate: Date;
    events: CalendarEvent[];
    modalHandlers: ReturnType<typeof useEventTicketHandling>;
}

export const CalendarModals: React.FC<CalendarModalsProps> = ({
    currentDate,
    events,
    modalHandlers,
}: CalendarModalsProps) => {
    const {
        selectedEventId,
        editingEventId,
        isDetailModalOpen,
        isEditModalOpen,
        handleEventUpdate,
        handleCancel,
        closeDetailModal,
    } = modalHandlers;

    const deleteEvent = useDeleteEvent();

    const selectedEvent = selectedEventId
        ? events.find((e) => e.id === selectedEventId)
        : null;
    const editingEvent = editingEventId
        ? events.find((e) => e.id === editingEventId)
        : null;

    return (
        <>
            {/* 이벤트 조회 모달 */}
            {isDetailModalOpen && (
                <Modal
                    clickEvent={closeDetailModal}
                    height="h-auto max-h-[80vh] overflow-y-auto"
                    showCloseButton={false}
                >
                    {selectedEvent && (
                        <EventTicketDetail
                            event={selectedEvent}
                            onUpdate={(event) => handleEventUpdate(event.id)}
                            onDelete={(eventId) =>
                                deleteEvent.mutate(eventId, {
                                    onSuccess: closeDetailModal,
                                })
                            }
                            onClose={closeDetailModal}
                        />
                    )}
                </Modal>
            )}

            {/* 이벤트 생성/수정 모달 */}
            {isEditModalOpen && (
                <Modal
                    clickEvent={handleCancel}
                    height="h-auto max-h-[90vh] overflow-y-auto"
                >
                    <EventTicketForm
                        onSubmit={handleCancel}
                        onCancel={handleCancel}
                        initialDate={currentDate}
                        initialEvent={editingEvent}
                    />
                </Modal>
            )}
        </>
    );
};
