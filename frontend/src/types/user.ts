/**
 * 사용자 관련 타입 정의
 */

/**
 * 사용자 정보
 */
export interface UserInfo {
    user_id: number;
    email: string;
    nickname: string;
    notification_enabled: boolean;
    created_at: string;
    updated_at: string;
}
