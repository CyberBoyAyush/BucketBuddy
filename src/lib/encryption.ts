import CryptoJS from 'crypto-js';

/**
 * Encrypts a string using AES-256 encryption with password
 * @param text - The text to encrypt
 * @param password - The password to use for encryption
 * @returns The encrypted text as a string
 */
export function encryptWithPassword(text: string, password: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, password).toString();
    return encrypted;
  } catch (error) {
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts a string using AES-256 decryption with password
 * @param encryptedText - The encrypted text to decrypt
 * @param password - The password to use for decryption
 * @returns The decrypted text as a string
 */
export function decryptWithPassword(encryptedText: string, password: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, password);
    const originalText = decrypted.toString(CryptoJS.enc.Utf8);

    if (!originalText) {
      throw new Error('Failed to decrypt data - invalid password or corrupted data');
    }

    return originalText;
  } catch (error) {
    throw new Error('Failed to decrypt data - invalid password or corrupted data');
  }
}

/**
 * Hashes a password for secure storage
 * @param password - The password to hash
 * @returns The hashed password
 */
export function hashPassword(password: string): string {
  try {
    return CryptoJS.SHA256(password).toString();
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

/**
 * Verifies a password against its hash
 * @param password - The password to verify
 * @param hash - The hash to verify against
 * @returns True if password matches hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  try {
    const passwordHash = CryptoJS.SHA256(password).toString();
    return passwordHash === hash;
  } catch (error) {
    return false;
  }
}

/**
 * Encrypts S3 credentials for secure storage with password
 * @param accessKey - The S3 access key
 * @param secretKey - The S3 secret key
 * @param password - The password to use for encryption
 * @returns Object with encrypted credentials
 */
export function encryptCredentialsWithPassword(accessKey: string, secretKey: string, password: string) {
  return {
    encryptedAccessKey: encryptWithPassword(accessKey, password),
    encryptedSecretKey: encryptWithPassword(secretKey, password),
  };
}

/**
 * Decrypts S3 credentials for use with password
 * @param encryptedAccessKey - The encrypted access key
 * @param encryptedSecretKey - The encrypted secret key
 * @param password - The password to use for decryption
 * @returns Object with decrypted credentials
 */
export function decryptCredentialsWithPassword(encryptedAccessKey: string, encryptedSecretKey: string, password: string) {
  return {
    accessKey: decryptWithPassword(encryptedAccessKey, password),
    secretKey: decryptWithPassword(encryptedSecretKey, password),
  };
}

/**
 * Generates a random encryption key (for setup purposes)
 * @returns A random 256-bit key as a hex string
 */
export function generateEncryptionKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString();
}
