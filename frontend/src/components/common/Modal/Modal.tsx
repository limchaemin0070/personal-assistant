import React, { useEffect } from 'react';
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

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            clickEvent();
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                clickEvent();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [clickEvent]);

    return (
        <Overlay onClick={handleOverlayClick}>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div
                className={`bg-white w-[370px] ${heightValue} rounded-2xl p-2 relative shadow-lg animate-fade-up`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative h-full">
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
