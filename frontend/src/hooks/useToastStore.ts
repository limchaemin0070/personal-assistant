import { create } from 'zustand';

export interface Toast {
    id: number;
    variant: 'success' | 'warning' | 'error';
    message: string;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (
        message: string,
        variant: 'success' | 'warning' | 'error',
    ) => void;
    removeToast: (id: number) => void;
}

/**
 *  addToasdt새로운 Toast 메시지를 추가하고 2초 후 자동 제거
 *  호출 시
 *  const { addToast } = useToastStore(); 불러와서
 *  () => addToast('Success message!', 'success') 형식으로 사용
 * @param message - 표시할 메시지 내용
 * @param variant - 메시지 타입 ('success' | 'warning' | 'error')
 */
export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (message, variant) => {
        const id = Date.now();
        set((state) => {
            const newToasts = [...state.toasts, { id, message, variant }];
            // 최대 3개까지만 유지, 초과 시 가장 오래된 것(첫 번째)부터 제거
            const maxToasts = 3;
            const limitedToasts =
                newToasts.length > maxToasts
                    ? newToasts.slice(-maxToasts)
                    : newToasts;
            return {
                toasts: limitedToasts,
            };
        });
    },
    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
        })),
}));
