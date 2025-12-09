import React, { useMemo } from 'react';
import { addDays } from 'date-fns';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { useCalendarLayout } from '@/hooks/calendar/useCalendarLayout';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import { useEventTicketHandling } from '@/hooks/event/useEventTicketHandling';
import {
    useCreateEvent,
    useDeleteEvent,
    useUpdateEvent,
} from '@/hooks/event/useEvent';
import { AddButton } from '../common/Button/AddButton';
import { EventTicketDetail } from '../event/EventTicketDetail';
import { EventTicketForm } from '../event/EventTicketForm';
import { Modal } from '../common/Modal/Modal';
import { MonthEventTicket } from '../event/MonthEventTicket';

interface CalendarWeekViewProps {
    currentDate: Date;
    selectedDate: Date | null;
    setSelectedDate: (date: Date | null) => void;
}

export const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
    currentDate,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedDate: _selectedDate,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setSelectedDate: _setSelectedDate,
}) => {
    const { allEvents, isLoading } = useCalendarEvents(currentDate);
    const { calculateDayLayout } = useCalendarLayout();

    const {
        hoveredEventId,
        selectedEventId,
        editingEventId,
        isDetailModalOpen,
        isEditModalOpen,
        handleHover,
        handleEventClick,
        handleEventUpdate,
        handleAdd,
        handleCancel,
        closeDetailModal,
    } = useEventTicketHandling();

    const createEvent = useCreateEvent();
    const updateEvent = useUpdateEvent();
    const deleteEvent = useDeleteEvent();

    const selectedEvent = selectedEventId
        ? allEvents.find((e) => e.id === selectedEventId)
        : null;
    const editingEvent = editingEventId
        ? allEvents.find((e) => e.id === editingEventId)
        : null;

    // 주의 시작일(일요일)부터 7일 계산
    const weekDays = useMemo(() => {
        const weekStart = CalendarUtils.getWeekStart(currentDate);
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }, [currentDate]);

    const renderDayColumn = (dayDate: Date) => {
        const dayEvents = calculateDayLayout(allEvents, dayDate);
        const dateKey = CalendarUtils.getDateKey(dayDate);

        return (
            <div
                key={dateKey}
                className="flex flex-col border-r border-gray-200 last:border-r-0 flex-1 min-w-0"
            >
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <div className="text-sm font-semibold text-gray-600">
                        {CalendarUtils.formatDayOfWeek(dayDate, true)}
                    </div>
                    <div className="text-xl font-bold">{dayDate.getDate()}</div>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-4">
                            <p className="text-sm text-gray-500">
                                이벤트를 불러오는 중...
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {dayEvents.map((event) => (
                                <MonthEventTicket
                                    key={`${event.id}-${dateKey}`}
                                    id={event.id}
                                    title={event.title}
                                    categoryColor={
                                        event.categoryColor || '#3b82f6'
                                    }
                                    startDate={event.startDate}
                                    endDate={event.endDate}
                                    startTime={event.startTime}
                                    endTime={event.endTime}
                                    isAllDay={event.isAllDay}
                                    row={0}
                                    span={1}
                                    isStart
                                    isEnd
                                    isWeekStart={false}
                                    isHovered={hoveredEventId === event.id}
                                    onHover={handleHover}
                                    onClick={handleEventClick}
                                    viewType="week"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="relative flex flex-1 h-full w-full bg-white">
            <div className="flex flex-1 overflow-x-auto">
                {weekDays.map((dayDate) => renderDayColumn(dayDate))}
            </div>
            <AddButton
                onClick={handleAdd}
                className="absolute bottom-6 right-6 z-50"
                variant="fab"
                size="md"
            />
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
                        onSubmit={(formData) => {
                            if (editingEventId) {
                                updateEvent.mutate(
                                    {
                                        eventId: editingEventId,
                                        formData,
                                    },
                                    {
                                        onSuccess: handleCancel,
                                    },
                                );
                            } else {
                                createEvent.mutate(formData, {
                                    onSuccess: handleCancel,
                                });
                            }
                        }}
                        onCancel={handleCancel}
                        initialDate={currentDate}
                        initialEvent={editingEvent}
                    />
                </Modal>
            )}
        </div>
    );
};
