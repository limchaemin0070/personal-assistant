import React, { useState } from 'react';
import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';
import { CalendarWeek } from './CalendarWeek';
import { useCalendar } from '@/hooks/calendar/useCalendar';
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents';
import { useCalendarLayout } from '@/hooks/calendar/useCalendarLayout';
import { AddButton } from '../common/Button/AddButton';
import { useModal } from '@/hooks/useModal';
import type { CalendarEvent } from '@/types/calendar';
import { EventTicketDetail } from '../event/EventTicketDetail';

// 전체 캘린더 뷰
export const Calander: React.FC = () => {
    // 캘린더
    const { currentDate, weekDays, headerText, goToNextMonth, goToPrevMonth } =
        useCalendar();

    // 이벤트(일정)
    const { monthEvents, isLoading } = useCalendarEvents(currentDate);

    // 이벤트 레이아웃 계산
    const { calculateMonthLayout } = useCalendarLayout();
    const eventsLayout = React.useMemo(() => {
        return calculateMonthLayout(monthEvents);
    }, [monthEvents, calculateMonthLayout]);

    // TODO : 이벤트 티켓은 여러 군데에서 재사용 가능하기 때문에
    // 티켓 핸들링 관련 로직들을 hook으로 분리할 계획
    // 호버 관련 상태
    const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

    // 모달 관련 상태 및 훅
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
        null,
    );
    const { openModal, closeModal, ModalComponent } = useModal();

    // 티켓 핸들러 함수
    const handleHover = (eventId: string | null) => {
        setHoveredEventId(eventId);
    };

    // 이벤트 클릭 핸들러
    const handleEventClick = (eventId: string) => {
        // 이벤트 ID로 해당 이벤트 찾기
        const event = monthEvents.find((e) => String(e.id) === eventId);
        if (event) {
            setSelectedEvent(event);
            openModal();
        }
    };

    // 이벤트 수정 핸들러
    const handleEventUpdate = (event: CalendarEvent) => {
        // TODO: 이벤트 수정 로직 구현
        // eslint-disable-next-line no-console
        console.log('이벤트 수정:', event);
    };

    // 이벤트 삭제 핸들러
    const handleEventDelete = (eventId: string | number) => {
        // TODO: 이벤트 삭제 로직 구현
        // eslint-disable-next-line no-console
        console.log('이벤트 삭제:', eventId);
        closeModal();
        setSelectedEvent(null);
    };

    // 이벤트 추가 버튼 핸들러 함수
    const handleAdd = () => {};

    // 드래그 앤 드롭 관련 [제외] - TODO : 수정 기능
    // const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
    // const [dragStartDate, setDragStartDate] = useState<Date | null>(null); // 원래 시작 날짜
    // const [dragCurrentDate, setDragCurrentDate] = useState<Date | null>(null); // 현재 마우스가 있는 날짜

    return (
        <div className="relative flex flex-col flex-1 h-full w-full bg-white">
            <div className="flex flex-row align-middle gap-5">
                {/* 캘린더 제목 */}
                <h3 className="text-2xl font-semibold">{headerText}</h3>
                {/* 캘린더 월 변경 컨트롤러 */}
                <div className="flex flex-row gap-2">
                    <button
                        className="p-2"
                        type="button"
                        onClick={goToPrevMonth}
                    >
                        <SlArrowLeft />
                    </button>
                    <button
                        className="p-2"
                        type="button"
                        onClick={goToNextMonth}
                    >
                        <SlArrowRight />
                    </button>
                </div>
            </div>
            {/* 요일 레인 */}
            {isLoading ? (
                <div className="flex items-center justify-center p-8">
                    <p>이벤트를 불러오는 중...</p>
                </div>
            ) : (
                weekDays.map((week) => {
                    // 주의 첫 번째 날짜를 key로 사용
                    const weekKey = week[0]?.date.toISOString() || '';
                    return (
                        <CalendarWeek
                            key={weekKey}
                            weekDays={week}
                            eventsLayout={eventsLayout}
                            // 호버 관련 Props
                            hoveredEventId={hoveredEventId}
                            onHover={handleHover}
                            // 클릭 관련 Props
                            onEventClick={handleEventClick}
                        />
                    );
                })
            )}
            <AddButton
                onClick={handleAdd}
                className="absolute bottom-6 right-6 z-50"
                variant="fab"
                size="md"
            />
            {/* 이벤트 상세보기 모달 */}
            <ModalComponent height="h-auto max-h-[80vh] overflow-y-auto">
                {selectedEvent && (
                    <EventTicketDetail
                        event={selectedEvent}
                        onUpdate={handleEventUpdate}
                        onDelete={handleEventDelete}
                    />
                )}
            </ModalComponent>
        </div>
    );
};
