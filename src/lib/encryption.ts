import CryptoJS from 'crypto-js';

// Get encryption key from environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required');
}

// Type assertion since we've checked it exists
const encryptionKey: string = ENCRYPTION_KEY;

/**
 * Encrypts a string using AES-256 encryption
 * @param text - The text to encrypt
 * @returns The encrypted text as a string
 */
export function encrypt(text: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, encryptionKey).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts a string using AES-256 decryption
 * @param encryptedText - The encrypted text to decrypt
 * @returns The decrypted text as a string
 */
export function decrypt(encryptedText: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, encryptionKey);
    const originalText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!originalText) {
      throw new Error('Failed to decrypt data - invalid key or corrupted data');
    }
    
    return originalText;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypts S3 credentials for secure storage
 * @param accessKey - The S3 access key
 * @param secretKey - The S3 secret key
 * @returns Object with encrypted credentials
 */
export function encryptCredentials(accessKey: string, secretKey: string) {
  return {
    encryptedAccessKey: encrypt(accessKey),
    encryptedSecretKey: encrypt(secretKey),
  };
}

/**
 * Decrypts S3 credentials for use
 * @param encryptedAccessKey - The encrypted access key
 * @param encryptedSecretKey - The encrypted secret key
 * @returns Object with decrypted credentials
 */
export function decryptCredentials(encryptedAccessKey: string, encryptedSecretKey: string) {
  return {
    accessKey: decrypt(encryptedAccessKey),
    secretKey: decrypt(encryptedSecretKey),
  };
}

/**
 * Generates a random encryption key (for setup purposes)
 * @returns A random 256-bit key as a hex string
 */
export function generateEncryptionKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString();
}
