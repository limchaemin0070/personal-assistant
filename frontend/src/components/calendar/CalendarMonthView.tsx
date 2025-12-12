import React from 'react';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { useCalendarLayout } from '@/hooks/calendar/useCalendarLayout';
import { AddButton } from '../common/Button/AddButton';
import { EventTicketDetail } from '../event/EventTicketDetail';
import { EventTicketForm } from '../event/EventTicketForm';
import { CalendarUtils } from '@/utils/calendar/CalendarUtils';
import { CalendarDayCell } from './CalendarDayCell';
import { useEventTicketHandling } from '@/hooks/event/useEventTicketHandling';
import { Modal } from '../common/Modal/Modal';
import type { CalendarDay } from '@/utils/calendar/CalendarUtils';
import { useDeleteEvent } from '@/hooks/event/useDeleteEvent';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
interface CalendarMonthViewProps {
    currentDate: Date;
    monthDays: CalendarDay[];
    onDateSelect: (date: Date) => void;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
    currentDate,
    monthDays,
    onDateSelect,
}) => {
    const { monthEvents, isLoading } = useCalendarEvents(currentDate);
    const { calculateMonthLayout } = useCalendarLayout();

    const eventsLayout = React.useMemo(() => {
        return calculateMonthLayout(monthEvents);
    }, [monthEvents, calculateMonthLayout]);

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

    // TODO : 삭제 확인 모달?
    const deleteEvent = useDeleteEvent();

    const selectedEvent = selectedEventId
        ? monthEvents.find((e) => e.id === selectedEventId)
        : null;
    const editingEvent = editingEventId
        ? monthEvents.find((e) => e.id === editingEventId)
        : null;

    const renderCalendarGrid = () => {
        // TODO : 로딩 스피너 혹은 스켈레톤 컴포넌트를 공용으로 작성하여 재활용
        if (isLoading) {
            return (
                <div className="flex items-center justify-center p-8">
                    <p>이벤트를 불러오는 중...</p>
                </div>
            );
        }

        return (
            <div className="calendar-grid">
                {monthDays.map((day) => {
                    const dateKey = CalendarUtils.getDateKey(day.date);
                    const dayEvents = eventsLayout.get(dateKey) || [];

                    return (
                        <CalendarDayCell
                            key={dateKey}
                            day={day}
                            events={dayEvents}
                            hoveredEventId={hoveredEventId}
                            onHover={handleHover}
                            onEventClick={handleEventClick}
                            onDoubleClick={() => {
                                // eslint-disable-next-line no-console
                                console.log(
                                    '날짜 셀 더블클릭 (일간 뷰 이동):',
                                    day.date,
                                );
                                onDateSelect(day.date);
                            }}
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <div className="relative flex flex-col flex-1 h-full w-full bg-white">
            <div className="calendar-grid-header">
                {weekDays.map((day) => (
                    <div key={day} className="calendar-weekday-header">
                        {day}
                    </div>
                ))}
            </div>
            {/* 캘린더 그리드 */}
            {renderCalendarGrid()}
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
                        onSubmit={handleCancel}
                        onCancel={handleCancel}
                        initialDate={currentDate}
                        initialEvent={editingEvent}
                    />
                </Modal>
            )}
        </div>
    );
};
