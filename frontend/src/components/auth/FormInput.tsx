import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface FormInputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur'> {
    value: string;
    onChange: (value: string) => void;
    onBlur?: (value: string) => void;
    placeholder: string;
    error?: string;
    className?: string;
}

export const FormInput = ({
    value,
    onChange,
    onBlur = () => {},
    placeholder,
    error = '',
    className = '',
    type = 'text',
    disabled,
    autoComplete,
    id,
    name,
}: FormInputProps) => {
    const inputClass = cn(error ? 'input-error' : 'input-base', className);
    return (
        <div>
            {/* 폼 입력 에러 텍스트영역 */}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            {/* 입력 폼 영역 */}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={(e) => onBlur(e.target.value)}
                placeholder={placeholder}
                className={inputClass}
                disabled={disabled}
                autoComplete={autoComplete}
                id={id}
                name={name}
            />
        </div>
    );
};
