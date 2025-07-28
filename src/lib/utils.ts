import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format date in a user-friendly way
 */
export function formatDate(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

/**
 * Get file type category from extension
 */
export function getFileType(filename: string): string {
  const extension = getFileExtension(filename).toLowerCase();
  
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
  const audioTypes = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'];
  const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
  const spreadsheetTypes = ['xls', 'xlsx', 'csv', 'ods'];
  const presentationTypes = ['ppt', 'pptx', 'odp'];
  const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'];
  const codeTypes = ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'json', 'xml', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs', 'swift'];
  
  if (imageTypes.includes(extension)) return 'image';
  if (videoTypes.includes(extension)) return 'video';
  if (audioTypes.includes(extension)) return 'audio';
  if (documentTypes.includes(extension)) return 'document';
  if (spreadsheetTypes.includes(extension)) return 'spreadsheet';
  if (presentationTypes.includes(extension)) return 'presentation';
  if (archiveTypes.includes(extension)) return 'archive';
  if (codeTypes.includes(extension)) return 'code';
  
  return 'file';
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate a random string
 */
export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if a string is a valid S3 key (object name)
 */
export function isValidS3Key(key: string): boolean {
  // S3 key restrictions
  if (key.length === 0 || key.length > 1024) return false;
  if (key.startsWith('/') || key.endsWith('/')) return false;
  if (key.includes('//')) return false;
  
  // Check for invalid characters
  const invalidChars = /[<>:"\\|?*\x00-\x1f\x7f]/;
  return !invalidChars.test(key);
}

/**
 * Sanitize filename for S3
 */
export function sanitizeS3Key(key: string): string {
  return key
    .replace(/[<>:"\\|?*\x00-\x1f\x7f]/g, '_')
    .replace(/\/+/g, '/')
    .replace(/^\/+|\/+$/g, '')
    .substring(0, 1024);
}

/**
 * Extract folder path from S3 key
 */
export function getFolderPath(key: string): string {
  const lastSlashIndex = key.lastIndexOf('/');
  return lastSlashIndex > 0 ? key.substring(0, lastSlashIndex + 1) : '';
}

/**
 * Extract filename from S3 key
 */
export function getFileName(key: string): string {
  const lastSlashIndex = key.lastIndexOf('/');
  return lastSlashIndex >= 0 ? key.substring(lastSlashIndex + 1) : key;
}

/**
 * Check if user has permission for bucket operation
 */
export function hasPermission(userRole: string, requiredPermission: 'read' | 'write' | 'admin'): boolean {
  const roleHierarchy = {
    viewer: ['read'],
    editor: ['read', 'write'],
    admin: ['read', 'write', 'admin'],
  };
  
  const userPermissions = roleHierarchy[userRole as keyof typeof roleHierarchy] || [];
  return userPermissions.includes(requiredPermission);
}
