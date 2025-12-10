// utils/timeUtils.ts
export class TimeUtils {
    /**
     * 시간 문자열 비교
     * @returns 양수: time1 > time2, 0: 같음, 음수: time1 < time2
     */
    static compare(time1: string | null, time2: string | null): number {
        if (!time1 || !time2) return -1;

        const [h1, m1] = time1.split(':').map(Number);
        const [h2, m2] = time2.split(':').map(Number);

        const minutes1 = h1 * 60 + m1;
        const minutes2 = h2 * 60 + m2;

        return minutes1 - minutes2;
    }

    /**
     * 시간에 분 추가
     */
    static addMinutes(time: string, minutesToAdd: number): string {
        const [hours, minutes] = time.split(':').map(Number);

        let totalMinutes = hours * 60 + minutes + minutesToAdd;

        // 24시간 넘어가면 순환
        totalMinutes %= 24 * 60;
        if (totalMinutes < 0) totalMinutes += 24 * 60;

        const newHours = Math.floor(totalMinutes / 60);
        const newMinutes = totalMinutes % 60;

        return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    }

    /**
     * 시간에 1시간 추가
     */
    static addOneHour(time: string): string {
        return this.addMinutes(time, 60);
    }

    /**
     * 시간 차이 계산 (분 단위)
     */
    static diffInMinutes(startTime: string, endTime: string): number {
        const [h1, m1] = startTime.split(':').map(Number);
        const [h2, m2] = endTime.split(':').map(Number);

        const minutes1 = h1 * 60 + m1;
        const minutes2 = h2 * 60 + m2;

        return minutes2 - minutes1;
    }
}
