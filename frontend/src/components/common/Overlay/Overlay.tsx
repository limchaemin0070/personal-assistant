import { type ReactNode } from 'react';

interface OverlayProps {
    children: ReactNode;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const Overlay = ({ children, onClick }: OverlayProps) => {
    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
            className="fixed inset-0 flex items-center justify-center w-full h-full bg-white/10 z-50"
            onClick={onClick}
        >
            {children}
        </div>
    );
};
