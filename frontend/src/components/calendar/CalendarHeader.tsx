import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';
import type { CalendarView } from '@/hooks/calendar/useCalendar';
import {
    SelectDropdown,
    type SelectOption,
} from '@/components/common/SelectDropdown';
import { authService } from '@/services/auth.service';

interface CalendarHeaderProps {
    headerText: string;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    view: CalendarView;
    setView: (view: CalendarView) => void;
}

// 캘린더 헤더 섹션
// 주간/일간/사이드바에서 공통 사용
export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    headerText,
    onPrevMonth,
    onNextMonth,
    view,
    setView,
}: CalendarHeaderProps) => {
    const navigate = useNavigate();
    const views: SelectOption<CalendarView>[] = [
        { value: 'month', label: '월' },
        { value: 'week', label: '주' },
        { value: 'day', label: '일' },
    ];

    const handleLogout = async () => {
        try {
            await authService.logout();
            navigate('/login');
        } catch {
            // 에러가 발생해도 로그인 페이지로 이동
            navigate('/login');
        }
    };

    return (
        <div className="flex flex-row items-center justify-between w-full gap-5">
            <div className="flex flex-row items-center gap-5">
                {/* 캘린더 월 변경 컨트롤러 */}
                <div className="flex flex-row gap-2">
                    <button className="p-2" type="button" onClick={onPrevMonth}>
                        <SlArrowLeft />
                    </button>
                    <button className="p-2" type="button" onClick={onNextMonth}>
                        <SlArrowRight />
                    </button>
                </div>
                {/* 캘린더 제목 */}
                <h3 className="text-2xl font-semibold">{headerText}</h3>
            </div>
            <div className="flex flex-row items-center gap-3">
                {/* 캘린더 뷰 변경 컨트롤러 */}
                <SelectDropdown
                    options={views}
                    value={view}
                    onChange={(newView) => setView(newView as CalendarView)}
                    multiple={false}
                />
                {/* 로그아웃 버튼 */}
                <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                    로그아웃
                </button>
            </div>
        </div>
    );
};
