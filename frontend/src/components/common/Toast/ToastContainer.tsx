import Toast from './Toast';
import { useToastStore } from '@/hooks/useToastStore';

const ToastContainer = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div
            className="fixed bottom-4 left-1/2 z-[9999] flex flex-col items-center w-full pointer-events-none"
            style={{ transform: 'translateX(-50%)' }}
        >
            <div className="flex flex-col items-center w-full pointer-events-auto">
                {toasts
                    .slice()
                    .reverse()
                    .map((toast) => (
                        <Toast
                            key={toast.id}
                            variant={toast.variant}
                            onClose={() => removeToast(toast.id)}
                        >
                            {toast.message}
                        </Toast>
                    ))}
            </div>
        </div>
    );
};

export default ToastContainer;
