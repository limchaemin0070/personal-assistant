/**
 * Toast 관련 타입 정의
 */

/**
 * Toast 메시지 타입
 */
export type ToastVariant = 'success' | 'warning' | 'error';

/**
 * Toast 메시지 객체
 */
export interface Toast {
    id: number;
    variant: ToastVariant;
    message: string;
}

/**
 * Toast Store 인터페이스
 */
export interface ToastStore {
    toasts: Toast[];
    addToast: (message: string, variant: ToastVariant) => void;
    removeToast: (id: number) => void;
}
