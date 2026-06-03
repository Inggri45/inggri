import * as CryptoJS from 'crypto-js';

export const AUTH_COOKIE_USER_ID = 'UserId';
export const AUTH_COOKIE_KEY = 'secretKey123';

export function encryptUserId(userId: string): string {
  return CryptoJS.AES.encrypt(userId, AUTH_COOKIE_KEY).toString();
}

export function decryptUserId(cipherText: string): string | null {
  if (!cipherText) {
    return null;
  }

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, AUTH_COOKIE_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted && decrypted !== 'undefined' ? decrypted : null;
  } catch {
    return null;
  }
}
