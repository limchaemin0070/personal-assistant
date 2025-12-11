import React, { useState, useEffect, useCallback } from 'react';
import { IoMdClose, IoIosWarning } from 'react-icons/io';
import { FaCheck } from 'react-icons/fa';
import { MdError } from 'react-icons/md';

interface ToastProps {
    children: React.ReactNode;
    variant: 'success' | 'warning' | 'error';
    onClose: () => void;
}

const iconStyles = 'w-5 h-5 md:w-6 md:h-6';
const closeStyles = 'w-5 h-5 md:w-6 md:h-6';

const iconComponents = {
    success: <FaCheck className={iconStyles} />,
    warning: <IoIosWarning className={iconStyles} />,
    error: <MdError className={iconStyles} />,
};

const variantStyles = {
    success: 'bg-green-500',
    warning: 'bg-yellow-400',
    error: 'bg-red-500',
};

const Toast = ({ children, variant = 'success', onClose }: ToastProps) => {
    const Icon = iconComponents[variant];
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 300); // 애니메이션 시간과 동일
    }, [onClose]);

    // 자동 제거 (2초 후)
    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 1000);

        return () => clearTimeout(timer);
    }, [handleClose]);

    return (
        <div
            className={`
            relative flex items-center
            w-[70%] md:w-[350px]
            h-[40px] md:h-[50px]
            mb-2 px-6 md:px-8
            rounded-lg text-white
            font-sans font-normal
            text-sm md:text-[16px]
            leading-[16px] md:leading-[26px]
            shadow-md 
            ${variantStyles[variant]}
            ${isExiting ? 'animate-toast-slide-out' : 'animate-toast-slide-in'}
        `}
        >
            <div className="flex items-center w-full gap-3">
                {Icon}
                <span className="flex-1 text-center truncate">{children}</span>
                <IoMdClose
                    onClick={handleClose}
                    className={`${closeStyles} cursor-pointer`}
                />
            </div>
        </div>
    );
};

export default Toast;
