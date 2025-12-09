import React from 'react';
import { Overlay } from '../Overlay/Overlay';

interface ModalProps {
    height?: string;
    children: React.ReactNode;
    clickEvent: () => void;
}

export const Modal = ({ height, children, clickEvent }: ModalProps) => {
    const heightValue = height || 'h-[200px]';

    return (
        <Overlay>
            <div
                className={`bg-white w-[370px] ${heightValue} rounded-2xl p-2 relative shadow-lg animate-fade-up`}
                onClick={clickEvent}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        clickEvent();
                    }
                }}
                tabIndex={0}
                role="button"
            >
                <div
                    className="relative h-full"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                        }
                    }}
                    role="presentation"
                >
                    {children}
                </div>
            </div>
        </Overlay>
    );
};
