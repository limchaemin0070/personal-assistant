import React from 'react';

interface ReminderSidebarProps {
    // eslint-disable-next-line react/require-default-props
    onClose?: () => void;
}

export const ReminderSidebar: React.FC<ReminderSidebarProps> = ({
    onClose,
}) => {
    return (
        <aside className="w-120 shrink-0 border-l border-gray-200 bg-white">
            <div className="flex h-full flex-col p-4">
                <div className="mb-4 flex items-center justify-between">
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    )}
                </div>
                <div className="flex-1 space-y-4">
                    <section>
                        <h3 className="mb-2 text-sm font-medium text-gray-700">
                            알람
                        </h3>
                        <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                            알람 목록
                        </div>
                    </section>
                    <section>
                        <h3 className="mb-2 text-sm font-medium text-gray-700">
                            리마인더
                        </h3>
                        <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                            리마인더 목록
                        </div>
                    </section>
                </div>
            </div>
        </aside>
    );
};
