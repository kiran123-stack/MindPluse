import CryptoJS from 'crypto-js';

// This is the logic used to lock and unlock user data
export const encryptMessage = (text: string, key: string): string => {
    return CryptoJS.AES.encrypt(text, key).toString();
};

export const decryptMessage = (cipherText: string, key: string): string => {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, key);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        return "Decryption Error";
    }
};