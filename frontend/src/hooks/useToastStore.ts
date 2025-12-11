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
        set((state) => ({
            toasts: [...state.toasts, { id, message, variant }],
        }));
        // 자동 제거는 Toast 컴포넌트에서 애니메이션과 함께 처리됩니다
    },
    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
        })),
}));
