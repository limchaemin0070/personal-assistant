// 기존 구독 해제 타이밍 해결하기 위한 디바운스 유틸
export class DebouncedActionManager<K = string> {
  private pendingActions = new Map<K, NodeJS.Timeout>();
  private readonly delay: number;

  constructor(delay: number = 200) {
    this.delay = delay;
  }

  /**
   * 액션을 디바운스하여 실행
   * @param key - 디바운스 키 -> 채널명
   * @param action - 실행할 액션
   * @returns 액션이 예약되었는지 여부
   */
  schedule(key: K, action: () => void | Promise<void>): boolean {
    // 기존 타이머 취소
    this.cancel(key);

    const timeoutId = setTimeout(async () => {
      this.pendingActions.delete(key);
      try {
        await action();
      } catch (error) {
        console.error(`[DebouncedAction] 실행 실패 (key: ${key}):`, error);
      }
    }, this.delay);

    this.pendingActions.set(key, timeoutId);
    return true;
  }

  /**
   * 예약된 액션 취소
   * @param key - 취소할 액션의 키
   * @returns 취소 성공 여부
   */
  cancel(key: K): boolean {
    const timeoutId = this.pendingActions.get(key);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.pendingActions.delete(key);
      return true;
    }
    return false;
  }

  /**
   * 액션이 예약되어 있는지 확인
   */
  isPending(key: K): boolean {
    return this.pendingActions.has(key);
  }

  /**
   * 모든 예약된 액션 취소 (cleanup용)
   */
  cancelAll(): void {
    for (const timeoutId of this.pendingActions.values()) {
      clearTimeout(timeoutId);
    }
    this.pendingActions.clear();
  }

  /**
   * 현재 예약된 액션 수
   */
  get pendingCount(): number {
    return this.pendingActions.size;
  }
}
