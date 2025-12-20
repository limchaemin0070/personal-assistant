import React from 'react';
import { BsBell, BsBellSlash } from 'react-icons/bs';
import { IoMdSettings } from 'react-icons/io';
import { LuPanelRight } from 'react-icons/lu';
import { MdLogout } from 'react-icons/md';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarMonthView } from './CalendarMonthView';
import { CalendarDayView } from './CalendarDayView';
import { CalendarWeekView } from './CalendarWeekView';
import { CalendarHeader } from './CalendarHeader';
import { DropdownMenu } from '@/components/common/DropdownMenu';
import { useCalendar } from '@/hooks/calendar/useCalendar';
import { SwitchButton } from '../common/Button/SwitchButton';
import { useLogout } from '@/hooks/Auth/useLogout';
import { useAuth } from '@/hooks/Auth/useAuth';
import { useEventTicketHandling } from '@/hooks/event/useEventTicketHandling';
import { AddButton } from '../common/Button/AddButton';
import { userService } from '@/services/user.service';
import { useToastStore } from '@/hooks/useToastStore';

interface CalendarMainProps {
    // eslint-disable-next-line react/require-default-props
    onToggleLeftSidebar?: () => void;
    // eslint-disable-next-line react/require-default-props
    onToggleRightSidebar?: () => void;
}

export const CalendarMain: React.FC<CalendarMainProps> = ({
    onToggleLeftSidebar,
    onToggleRightSidebar,
}) => {
    const {
        currentDate,
        view,
        setView,
        selectedDate,
        setSelectedDate,
        headerText,
        handlePrev,
        handleNext,
        handleDateSelect,
    } = useCalendar();

    const { logout } = useLogout();
    const { user } = useAuth();
    const modalHandlers = useEventTicketHandling();
    const queryClient = useQueryClient();
    const { addToast } = useToastStore();

    const updateNotificationMutation = useMutation({
        mutationFn: (notification_enabled: boolean) =>
            userService.updateNotificationEnabled(notification_enabled),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
            const isEnabled = response.result?.notification_enabled ?? false;
            addToast(
                isEnabled
                    ? '알람이 활성화되었습니다.'
                    : '알람이 비활성화되었습니다.',
                'success',
            );
        },
        onError: () => {
            addToast('알람 설정 변경에 실패했습니다.', 'error');
        },
    });

    const handleSwitch = (checked: boolean) => {
        updateNotificationMutation.mutate(checked);
    };

    const renderCalendarView = () => {
        switch (view) {
            case 'month':
                return (
                    <CalendarMonthView
                        currentDate={currentDate}
                        modalHandlers={modalHandlers}
                        onDateSelect={handleDateSelect}
                    />
                );
            case 'week':
                return (
                    <CalendarWeekView
                        currentDate={currentDate}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        modalHandlers={modalHandlers}
                    />
                );
            case 'day':
                return (
                    <CalendarDayView
                        currentDate={currentDate}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        modalHandlers={modalHandlers}
                    />
                );
            default:
                return (
                    <CalendarMonthView
                        currentDate={currentDate}
                        modalHandlers={modalHandlers}
                        onDateSelect={handleDateSelect}
                    />
                );
        }
    };

    return (
        <main className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center gap-2 bg-white px-4 py-3">
                {onToggleLeftSidebar && (
                    <button
                        type="button"
                        onClick={onToggleLeftSidebar}
                        className="btn-icon-sm"
                    >
                        ☰
                    </button>
                )}
                {/* 캘린더 헤더 */}
                <CalendarHeader
                    headerText={headerText}
                    onPrevMonth={handlePrev}
                    onNextMonth={handleNext}
                    view={view}
                    setView={setView}
                />
                <SwitchButton
                    checked={user?.notification_enabled ?? false}
                    onCheckedChange={handleSwitch}
                    activeIcon={<BsBell />}
                    inactiveIcon={<BsBellSlash />}
                    size="sm"
                    className="text-gray-600 hover:bg-gray-100"
                    disabled={updateNotificationMutation.isPending}
                />
                {/* 설정 드롭다운 메뉴
                현재는 로그아웃 버튼만
                추후 프로필이나 마이페이지 섹션 삽입 가능 */}
                <DropdownMenu
                    trigger={
                        <button type="button" className="btn-icon">
                            <IoMdSettings />
                        </button>
                    }
                    items={[
                        {
                            value: 'logout',
                            label: '로그아웃',
                            icon: <MdLogout />,
                            onClick: logout,
                        },
                    ]}
                    align="right"
                />
                {onToggleRightSidebar && (
                    <button
                        type="button"
                        onClick={onToggleRightSidebar}
                        className="btn-icon"
                    >
                        <LuPanelRight />
                    </button>
                )}
            </div>
            <div className="relative flex flex-1">
                {renderCalendarView()}
                <AddButton
                    onClick={modalHandlers.handleAdd}
                    className="absolute bottom-6 right-6 z-50"
                    variant="fab"
                    size="md"
                />
            </div>
        </main>
    );
};
