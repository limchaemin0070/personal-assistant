// MonthEventTicket.tsx
interface MonthEventTicketProps {
    id: string;
    title: string;
    categoryColor?: string; // 카테고리 색상 (책갈피 및 배경색에 사용)

    startDate: Date;
    endDate: Date;

    row: number; // 몇 번째 줄
    span: number; // 며칠간 이어지는지
    isStart: boolean; // 시작일인지
    isEnd?: boolean; // 종료일인지 (옵션)

    // onClick?: (id: string) => void;
}

export const MonthEventTicket = ({
    id,
    title,
    categoryColor = '#78716c', // 기본 카테고리 색상

    startDate,
    endDate,

    row,
    span,
    isStart,
    isEnd,

    // onClick,
}: MonthEventTicketProps) => {
    // const handleClick = () => {
    //     onClick?.(id);
    // };

    // 카테고리 색상에 따른 배경색 계산 (연한 색상)
    const getBackgroundColor = (color: string): string => {
        // HEX 색상을 RGB로 변환
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // 연한 배경색 생성 (투명도 적용)
        return `rgba(${r}, ${g}, ${b}, 0.15)`;
    };

    return (
        <div
            className={`month-event-ticket ${isStart ? 'is-start' : ''}`}
            style={
                {
                    '--event-ticket-category-color': categoryColor,
                    '--event-ticket-bg-color':
                        getBackgroundColor(categoryColor),
                    gridRow: row + 1,
                    gridColumn: `span ${span}`,
                } as React.CSSProperties
            }
            // onClick={handleClick}
        >
            {/* 시작일에만 제목 표시 */}
            {isStart && <span className="event-title">{title}</span>}
        </div>
    );
};
