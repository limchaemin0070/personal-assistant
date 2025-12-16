/**
 * 알람 관련 유틸리티 함수
 * TODO : 유틸 말고 다른곳에서 처리
 */

/**
 * repeat_days 정규화
 * DB에 문자열로 저장된 repeat_days를 number[]로 변환
 * 예: "[0,1,2]" -> [0,1,2]
 */
export function normalizeRepeatDays(
  repeatDays: string | number[] | null | undefined
): number[] {
  if (Array.isArray(repeatDays)) {
    return repeatDays.filter((v) => typeof v === "number");
  }

  if (typeof repeatDays === "string") {
    try {
      const parsed = JSON.parse(repeatDays);
      return Array.isArray(parsed)
        ? parsed.filter((v) => typeof v === "number")
        : [];
    } catch {
      return [];
    }
  }

  return [];
}
