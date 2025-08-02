/**
 * Password Manager for handling bucket encryption passwords
 * Stores passwords in localStorage for session persistence
 */

interface BucketPassword {
  bucketId: string;
  password: string;
  timestamp: number;
}

const STORAGE_KEY = 'bucket-passwords';
const PASSWORD_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Store a bucket password in localStorage
 * @param bucketId - The bucket ID
 * @param password - The encryption password
 */
export function storeBucketPassword(bucketId: string, password: string): void {
  try {
    const passwords = getBucketPasswords();

    // Ensure passwords is an array
    if (!Array.isArray(passwords)) {
      console.error('getBucketPasswords() did not return an array:', passwords);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return storeBucketPassword(bucketId, password); // Retry with empty array
    }

    const existingIndex = passwords.findIndex(p => p.bucketId === bucketId);

    const bucketPassword: BucketPassword = {
      bucketId,
      password,
      timestamp: Date.now(),
    };

    if (existingIndex >= 0) {
      passwords[existingIndex] = bucketPassword;
    } else {
      passwords.push(bucketPassword);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(passwords));
  } catch (error) {
    console.error('Error storing bucket password:', error);
  }
}

/**
 * Retrieve a bucket password from localStorage
 * @param bucketId - The bucket ID
 * @returns The password if found and not expired, null otherwise
 */
export function getBucketPassword(bucketId: string): string | null {
  try {
    const passwords = getBucketPasswords();
    const bucketPassword = passwords.find(p => p.bucketId === bucketId);
    
    if (!bucketPassword) {
      return null;
    }

    // Check if password has expired
    if (Date.now() - bucketPassword.timestamp > PASSWORD_EXPIRY) {
      removeBucketPassword(bucketId);
      return null;
    }

    return bucketPassword.password;
  } catch (error) {
    console.error('Error retrieving bucket password:', error);
    return null;
  }
}

/**
 * Remove a bucket password from localStorage
 * @param bucketId - The bucket ID
 */
export function removeBucketPassword(bucketId: string): void {
  try {
    const passwords = getBucketPasswords();
    const filteredPasswords = passwords.filter(p => p.bucketId !== bucketId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPasswords));
  } catch (error) {
    console.error('Error removing bucket password:', error);
  }
}

/**
 * Check if a bucket password is stored
 * @param bucketId - The bucket ID
 * @returns True if password is stored and not expired
 */
export function hasBucketPassword(bucketId: string): boolean {
  return getBucketPassword(bucketId) !== null;
}

/**
 * Clear all stored bucket passwords
 */
export function clearAllBucketPasswords(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing bucket passwords:', error);
  }
}

/**
 * Clean up expired passwords
 */
export function cleanupExpiredPasswords(): void {
  try {
    const passwords = getBucketPasswords();
    const now = Date.now();
    const validPasswords = passwords.filter(p => now - p.timestamp <= PASSWORD_EXPIRY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validPasswords));
  } catch (error) {
    console.error('Error cleaning up expired passwords:', error);
  }
}

/**
 * Get all bucket passwords from localStorage
 * @returns Array of bucket passwords
 */
function getBucketPasswords(): BucketPassword[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    // Ensure we always return an array
    if (!Array.isArray(parsed)) {
      console.error('Stored passwords is not an array:', parsed);
      localStorage.removeItem(STORAGE_KEY); // Clear corrupted data
      return [];
    }

    return parsed;
  } catch (error) {
    console.error('Error parsing stored passwords:', error);
    localStorage.removeItem(STORAGE_KEY); // Clear corrupted data
    return [];
  }
}

/**
 * Initialize password manager (cleanup expired passwords)
 */
export function initializePasswordManager(): void {
  cleanupExpiredPasswords();
}
