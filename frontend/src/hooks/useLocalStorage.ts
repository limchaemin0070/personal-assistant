import { useState } from 'react';
import { useToastStore } from './useToastStore';

/**
 * 로컬스토리지 커스텀 훅
 * @param key 로컬스토리지 키
 * @param initialValue 초기값
 */
export function useLocalStorage<T>(key: string, initialValue?: T) {
    const { addToast } = useToastStore();

    // 로컬스토리지에서 초기값을 가져오거나 initialValue 사용
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            addToast('정보를 불러오는데 실패했습니다.', 'error');
            console.error(error);
            return initialValue;
        }
    });

    /**
     * 값을 로컬스토리지와 상태에 저장
     * @param value 저장할 값 또는 업데이트 함수
     */
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;

            // 상태 업데이트
            setStoredValue(valueToStore);

            // 로컬스토리지 저장
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            addToast('정보를 저장하는데 실패했습니다.', 'error');
            console.error(error);
        }
    };

    /**
     * 로컬스토리지에서 값을 제거
     */
    const removeValue = () => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue as T);
        } catch (error) {
            addToast('정보를 삭제하는데 실패했습니다.', 'error');
            console.error(error);
        }
    };

    return { storedValue, setValue, removeValue };
}
