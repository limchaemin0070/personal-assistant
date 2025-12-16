import { AlarmTransportPayload } from "../../../types/notification";

/**
 * 알람 전송 채널 인터페이스
 * 각 전송 채널(Redis, Push, Email 등)은 이 인터페이스를 구현해서 사용
 */
export interface AlarmSender {
  /**
   * 알람 전송
   * @param payload 전송할 알람 페이로드
   * @throws 전송 실패 시 에러
   */
  send(payload: AlarmTransportPayload): Promise<void>;

  readonly name: string;
}
