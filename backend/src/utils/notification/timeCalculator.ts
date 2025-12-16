// 스케줄러에서 사용하는 알람 시간들을 계산하는 유틸함수들

// src/utils/timeCalculator.ts

/**
 * 알람 시간 계산 유틸리티
 * 순수 함수로 구성 (의존성 없음)
 */
export class TimeCalculator {
  /**
   * Event 알람 트리거 시간 계산
   * Event 알람 : 일회성 알람들
   */
  static calculateEventTriggerTime(
    time: string,
    date?: string,
    timezone: string = "Asia/Seoul"
  ): Date {
    const [hour = "0", minute = "0", second = "0"] = time.split(":");

    if (date) {
      const triggerDate = new Date(date);
      triggerDate.setHours(parseInt(hour), parseInt(minute), parseInt(second));
      return triggerDate;
    }

    const today = new Date();
    today.setHours(parseInt(hour), parseInt(minute), parseInt(second), 0);

    if (today.getTime() < Date.now()) {
      today.setDate(today.getDate() + 1);
    }

    return today;
  }

  /**
   * 알람 다음 트리거 시간 계산
   * 요일로 반복되는 알람들
   */
  static calculateNextTriggerTime(
    time: string,
    repeatDays: number[],
    fromDate: Date = new Date()
  ): Date | null {
    if (!repeatDays || repeatDays.length === 0) {
      return null;
    }

    const [hour = "0", minute = "0", second = "0"] = time.split(":");

    // 오늘부터 7일 탐색
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(fromDate);
      checkDate.setDate(fromDate.getDate() + i);
      checkDate.setHours(parseInt(hour), parseInt(minute), parseInt(second), 0);

      const dayOfWeek = checkDate.getDay();

      if (
        repeatDays.includes(dayOfWeek) &&
        checkDate.getTime() > fromDate.getTime()
      ) {
        return checkDate;
      }
    }

    // 7일 내 없으면 다음 주 첫 요일
    const firstDay = Math.min(...repeatDays);
    const daysUntilFirst = (firstDay + 7 - fromDate.getDay()) % 7 || 7;
    const nextDate = new Date(fromDate);
    nextDate.setDate(fromDate.getDate() + daysUntilFirst);
    nextDate.setHours(parseInt(hour), parseInt(minute), parseInt(second), 0);

    return nextDate;
  }

  /**
   * 남은 시간(초) 계산
   */
  static calculateRemainingSeconds(
    targetTime: Date,
    fromTime: Date = new Date()
  ): number {
    return Math.floor((targetTime.getTime() - fromTime.getTime()) / 1000);
  }

  /**
   * 시간 형식 검증
   */
  static validateTimeFormat(time: string): boolean {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;
    return regex.test(time);
  }

  /**
   * 요일 배열 검증
   */
  static validateRepeatDays(days: number[]): boolean {
    if (!Array.isArray(days) || days.length === 0) {
      return false;
    }
    return days.every((day) => day >= 0 && day <= 6);
  }
}
