import { useState, useEffect } from 'react';

/**
 * 로딩 상태를 지연시켜 표시하는 훅
 * 빠른 응답(200ms 이내)에는 스피너를 표시하지 않고,
 * 실제로 시간이 걸릴 때만 스피너가 나타나도록 합니다.
 *
 * @param loading - 로딩 상태
 * @param delay - 스피너를 표시하기 전 대기 시간 (기본값: 200ms)
 * @returns 지연된 로딩 상태
 */
export const useDelayedLoading = (loading: boolean, delay: number = 200) => {
    const [showSpinner, setShowSpinner] = useState(false);

    useEffect(() => {
        if (loading) {
            // delay 시간 후에만 스피너 표시
            const timer = setTimeout(() => setShowSpinner(true), delay);
            return () => {
                clearTimeout(timer);
            };
        }
        setShowSpinner(false);
        return undefined;
    }, [loading, delay]);

    return showSpinner;
};
