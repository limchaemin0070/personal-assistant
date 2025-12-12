import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';
import type { CalendarView } from '@/hooks/calendar/useCalendar';
import { SelectViewDropdown } from './SelectViewDropdown';

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
            {/* 캘린더 뷰 변경 컨트롤러 */}
            <SelectViewDropdown view={view} setView={setView} />
        </div>
    );
};
