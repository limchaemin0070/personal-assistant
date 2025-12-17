import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BsBell, BsBellSlash } from 'react-icons/bs';
import { IoMdSettings } from 'react-icons/io';
import { LuPanelRight } from 'react-icons/lu';
import { MdLogout } from 'react-icons/md';
import { CalendarMonthView } from './CalendarMonthView';
import { CalendarDayView } from './CalendarDayView';
import { CalendarWeekView } from './CalendarWeekView';
import { CalendarHeader } from './CalendarHeader';
import { DropdownMenu } from '@/components/common/DropdownMenu';
import { useCalendar } from '@/hooks/calendar/useCalendar';
import { authService } from '@/services/auth.service';
import { SwitchButton } from '../common/Button/SwitchButton';
import { setLoggingOut } from '@/utils/apiState';
import { useLogout } from '@/hooks/Auth/useLogout';

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
        monthDays,
        headerText,
        handleDateSelect,
        handlePrev,
        handleNext,
    } = useCalendar();

    const { logout } = useLogout();

    const handleSwitch = async () => {
        // TODO: 알람 권한 변경 로직 구현
    };

    const renderCalendarView = () => {
        switch (view) {
            case 'month':
                return (
                    <CalendarMonthView
                        currentDate={currentDate}
                        monthDays={monthDays}
                        onDateSelect={handleDateSelect}
                    />
                );
            case 'week':
                return (
                    <CalendarWeekView
                        currentDate={currentDate}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                    />
                );
            case 'day':
                return (
                    <CalendarDayView
                        currentDate={currentDate}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                    />
                );
            default:
                return (
                    <CalendarMonthView
                        currentDate={currentDate}
                        monthDays={monthDays}
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
                        className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
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
                    checked={false}
                    onCheckedChange={handleSwitch}
                    activeIcon={<BsBell />}
                    inactiveIcon={<BsBellSlash />}
                    className="text-gray-600 hover:bg-gray-100"
                />
                {/* 설정 드롭다운 메뉴
                현재는 로그아웃 버튼만
                추후 프로필이나 마이페이지 섹션 삽입 가능 */}
                <DropdownMenu
                    trigger={
                        <button
                            type="button"
                            className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
                        >
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
                        className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
                    >
                        <LuPanelRight />
                    </button>
                )}
            </div>
            <div className="flex flex-1">{renderCalendarView()}</div>
        </main>
    );
};
