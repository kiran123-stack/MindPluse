import CryptoJS from 'crypto-js';

// Encrypt message using the Secret Key
export const encryptMessage = (message: string, secretKey: string) => {
  return CryptoJS.AES.encrypt(message, secretKey).toString();
};

// Decrypt message when showing it in the UI
export const decryptMessage = (ciphertext: string, secretKey: string) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};