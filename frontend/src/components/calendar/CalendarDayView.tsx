import React from 'react';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { useCalendarLayout } from '@/hooks/calendar/useCalendarLayout';
import { AddButton } from '../common/Button/AddButton';
import { EventTicketDetail } from '../event/EventTicketDetail';
import { EventTicketForm } from '../event/EventTicketForm';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import { useEventTicketHandling } from '@/hooks/event/useEventTicketHandling';
import {
    useCreateEvent,
    useDeleteEvent,
    useUpdateEvent,
} from '@/hooks/event/useEvent';
import { Modal } from '../common/Modal/Modal';
import { MonthEventTicket } from '../event/MonthEventTicket';

interface CalendarDayViewProps {
    currentDate: Date;
    selectedDate: Date | null;
    setSelectedDate: (date: Date | null) => void;
}

export const CalendarDayView: React.FC<CalendarDayViewProps> = ({
    currentDate,
    selectedDate,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setSelectedDate: _setSelectedDate,
}) => {
    // 일간 뷰에서는 월 필터링이 아닌 전체 이벤트를 가져와야 다른 달로 이동해도 이벤트 표시 가능
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

    // 일간 뷰에서 표시할 날짜 (selectedDate가 있으면 그것을, 없으면 currentDate 사용)
    const displayDate = selectedDate || currentDate;

    const dayEvents = React.useMemo(() => {
        return calculateDayLayout(allEvents, displayDate);
    }, [allEvents, displayDate, calculateDayLayout]);

    const renderEventList = () => {
        // TODO : 로딩 스피너 혹은 스켈레톤 컴포넌트를 공용으로 작성하여 재활용
        if (isLoading) {
            return (
                <div className="flex items-center justify-center p-8">
                    <p>이벤트를 불러오는 중...</p>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-3 p-5">
                <div className="flex items-end gap-2">
                    <div className="font-bold text-4xl">
                        {displayDate.getDate()}
                    </div>
                    <div className="font-bold text-lg text-gray-600">
                        {CalendarUtils.formatDayOfWeek(displayDate)}
                    </div>
                </div>
                <div className="border-t border-gray-300" />
                <div className="flex flex-col">
                    {dayEvents.map((event) => (
                        <MonthEventTicket
                            key={`${event.id}-${CalendarUtils.getDateKey(displayDate)}`}
                            id={event.id}
                            title={event.title}
                            categoryColor={event.categoryColor || '#3b82f6'}
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
                            viewType="day"
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="relative flex flex-col flex-1 h-full w-full bg-white">
            {/* 캘린더 그리드 */}
            {renderEventList()}
            <AddButton
                onClick={handleAdd}
                className="absolute bottom-6 right-6 z-50"
                variant="fab"
                size="md"
            />
            {/* 공통 섹션 */}
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
