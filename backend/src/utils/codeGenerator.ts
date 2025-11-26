/**
 * 임시로 random 사용중
 *  TODO : crypto.randomBytes
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
