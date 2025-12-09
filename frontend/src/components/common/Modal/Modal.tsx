import React from 'react';
import { Overlay } from '../Overlay/Overlay';
import { CloseButton } from '../Button/CloseButton';

interface ModalProps {
    height?: string;
    children: React.ReactNode;
    clickEvent: () => void;
    showCloseButton?: boolean;
}

export const Modal = ({
    height,
    children,
    clickEvent,
    showCloseButton = true,
}: ModalProps) => {
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
                    {showCloseButton && (
                        <CloseButton
                            onClick={clickEvent}
                            variant="secondary"
                            size="lg"
                            className="absolute top-2 right-2 z-10"
                        />
                    )}
                    {children}
                </div>
            </div>
        </Overlay>
    );
};
