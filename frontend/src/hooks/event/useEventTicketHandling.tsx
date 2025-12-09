import { useState, useEffect } from 'react';

type ModalType = 'none' | 'detail' | 'create' | 'edit';

interface ModalState {
    type: ModalType;
    eventId: number | null;
}

interface UseEventTicketHandlingReturn {
    hoveredEventId: number | null;
    selectedEventId: number | null;
    editingEventId: number | null;

    modalState: ModalState;

    isDetailModalOpen: boolean;
    isEditModalOpen: boolean;

    handleHover: (eventId: number | null) => void;
    handleEventClick: (eventId: number) => void;
    handleEventUpdate: (eventId: number) => void;
    handleAdd: () => void;
    handleCancel: () => void;
    closeDetailModal: () => void;
}

// 프레젠테이션 레이어 (UI 상태)
export const useEventTicketHandling = (): UseEventTicketHandlingReturn => {
    const [hoveredEventId, setHoveredEventId] = useState<number | null>(null);
    const [modalState, setModalState] = useState<ModalState>({
        type: 'none',
        eventId: null,
    });

    // const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    // const [editingEventId, setEditingEventId] = useState<number | null>(null);

    const isDetailModalOpen = modalState.type === 'detail';
    const isEditModalOpen =
        modalState.type === 'create' || modalState.type === 'edit';
    const selectedEventId =
        modalState.type === 'detail' ? modalState.eventId : null;
    const editingEventId =
        modalState.type === 'edit' ? modalState.eventId : null;

    // 디버깅용
    useEffect(() => {
        console.log('useEventTicketHandling modalState 변경:', modalState);
    }, [modalState]);

    const handleEventClick = (eventId: number) => {
        setModalState({ type: 'detail', eventId });
    };

    const handleEventUpdate = (eventId: number) => {
        setModalState({ type: 'edit', eventId });
    };

    const handleAdd = () => {
        setModalState({ type: 'create', eventId: null });
    };

    const handleCancel = () => {
        setModalState({ type: 'none', eventId: null });
    };

    const closeDetailModal = () => {
        setModalState({ type: 'none', eventId: null });
    };

    return {
        hoveredEventId,
        selectedEventId,
        editingEventId,
        modalState,
        isDetailModalOpen,
        isEditModalOpen,
        handleHover: setHoveredEventId,
        handleEventClick,
        handleEventUpdate,
        handleAdd,
        handleCancel,
        closeDetailModal,
    };
};
