import { useId } from 'react';

interface CheckboxProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    className?: string;
}

export const Checkbox = ({
    checked,
    onCheckedChange,
    disabled = false,
    label,
    className = '',
}: CheckboxProps) => {
    const id = useId();

    return (
        <label
            htmlFor={id}
            className={`inline-flex items-center gap-2 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(e) => onCheckedChange(e.target.checked)}
                disabled={disabled}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            {label && <span className="select-none">{label}</span>}
        </label>
    );
};
