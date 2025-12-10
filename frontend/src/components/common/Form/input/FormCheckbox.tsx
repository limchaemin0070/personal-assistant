import React from 'react';

interface FormCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    name?: string;
    label?: string;
}

/**
 * 종일 체크박스 컴포넌트
 * 스케줄/리마인더에서 사용하며, 체크 시 시간 입력을 숨기는 용도
 * 알람에서는 사용하지 않음 (무조건 시간 지정 필요)
 */
export const FormCheckbox: React.FC<FormCheckboxProps> = ({
    checked,
    onChange,
    disabled,
    id = 'isAllDay',
    name = 'isAllDay',
    label = '종일',
}) => {
    return (
        <div className="flex items-center gap-2">
            <label
                htmlFor={id}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer"
            >
                <input
                    id={id}
                    name={name}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="checkbox-base"
                    disabled={disabled}
                />
                {label}
            </label>
        </div>
    );
};
