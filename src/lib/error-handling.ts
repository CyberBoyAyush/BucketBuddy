/**
 * Comprehensive error handling utilities for S3R2UI
 */

export interface AppError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
}

export class S3R2UIError extends Error {
  public code: string;
  public statusCode: number;
  public details?: any;

  constructor(code: string, message: string, statusCode = 500, details?: any) {
    super(message);
    this.name = 'S3R2UIError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Common error codes and their user-friendly messages
 */
export const ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Bucket errors
  BUCKET_NOT_FOUND: 'BUCKET_NOT_FOUND',
  BUCKET_ACCESS_DENIED: 'BUCKET_ACCESS_DENIED',
  BUCKET_CONNECTION_FAILED: 'BUCKET_CONNECTION_FAILED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // File operation errors
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  DOWNLOAD_FAILED: 'DOWNLOAD_FAILED',
  DELETE_FAILED: 'DELETE_FAILED',
  RENAME_FAILED: 'RENAME_FAILED',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Generic errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.UNAUTHORIZED]: 'You need to sign in to access this resource.',
  [ERROR_CODES.FORBIDDEN]: 'You don\'t have permission to perform this action.',
  [ERROR_CODES.SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
  
  [ERROR_CODES.BUCKET_NOT_FOUND]: 'The requested bucket could not be found.',
  [ERROR_CODES.BUCKET_ACCESS_DENIED]: 'Access denied to this bucket. Check your permissions.',
  [ERROR_CODES.BUCKET_CONNECTION_FAILED]: 'Failed to connect to the bucket. Please check your credentials and try again.',
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid bucket credentials. Please verify your access key and secret key.',
  
  [ERROR_CODES.FILE_NOT_FOUND]: 'The requested file could not be found.',
  [ERROR_CODES.FILE_TOO_LARGE]: 'File is too large to upload. Please choose a smaller file.',
  [ERROR_CODES.UPLOAD_FAILED]: 'Failed to upload file. Please try again.',
  [ERROR_CODES.DOWNLOAD_FAILED]: 'Failed to download file. Please try again.',
  [ERROR_CODES.DELETE_FAILED]: 'Failed to delete file. Please try again.',
  [ERROR_CODES.RENAME_FAILED]: 'Failed to rename file. Please try again.',
  
  [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
  [ERROR_CODES.TIMEOUT]: 'Request timed out. Please try again.',
  
  [ERROR_CODES.INVALID_INPUT]: 'Invalid input provided. Please check your data and try again.',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Required field is missing. Please fill in all required fields.',
  
  [ERROR_CODES.INTERNAL_ERROR]: 'An internal error occurred. Please try again later.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
};

/**
 * Parse and normalize errors from different sources
 */
export function parseError(error: any): AppError {
  // If it's already our custom error
  if (error instanceof S3R2UIError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  // Handle fetch/network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      code: ERROR_CODES.NETWORK_ERROR,
      message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
      statusCode: 0,
    };
  }

  // Handle timeout errors
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return {
      code: ERROR_CODES.TIMEOUT,
      message: ERROR_MESSAGES[ERROR_CODES.TIMEOUT],
      statusCode: 408,
    };
  }

  // Handle HTTP response errors
  if (error.status || error.statusCode) {
    const statusCode = error.status || error.statusCode;
    
    switch (statusCode) {
      case 401:
        return {
          code: ERROR_CODES.UNAUTHORIZED,
          message: ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED],
          statusCode: 401,
        };
      case 403:
        return {
          code: ERROR_CODES.FORBIDDEN,
          message: ERROR_MESSAGES[ERROR_CODES.FORBIDDEN],
          statusCode: 403,
        };
      case 404:
        return {
          code: ERROR_CODES.FILE_NOT_FOUND,
          message: ERROR_MESSAGES[ERROR_CODES.FILE_NOT_FOUND],
          statusCode: 404,
        };
      case 413:
        return {
          code: ERROR_CODES.FILE_TOO_LARGE,
          message: ERROR_MESSAGES[ERROR_CODES.FILE_TOO_LARGE],
          statusCode: 413,
        };
      default:
        return {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
          statusCode,
        };
    }
  }

  // Handle AWS SDK errors
  if (error.name && error.name.includes('AWS')) {
    if (error.name === 'NoSuchBucket') {
      return {
        code: ERROR_CODES.BUCKET_NOT_FOUND,
        message: ERROR_MESSAGES[ERROR_CODES.BUCKET_NOT_FOUND],
        statusCode: 404,
      };
    }
    
    if (error.name === 'AccessDenied') {
      return {
        code: ERROR_CODES.BUCKET_ACCESS_DENIED,
        message: ERROR_MESSAGES[ERROR_CODES.BUCKET_ACCESS_DENIED],
        statusCode: 403,
      };
    }
    
    if (error.name === 'InvalidAccessKeyId' || error.name === 'SignatureDoesNotMatch') {
      return {
        code: ERROR_CODES.INVALID_CREDENTIALS,
        message: ERROR_MESSAGES[ERROR_CODES.INVALID_CREDENTIALS],
        statusCode: 401,
      };
    }
  }

  // Generic error fallback
  return {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: error.message || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
    statusCode: 500,
    details: error,
  };
}

/**
 * Log errors with context
 */
export function logError(error: any, context?: string) {
  const parsedError = parseError(error);
  
  console.error(`[S3R2UI Error]${context ? ` ${context}:` : ''}`, {
    code: parsedError.code,
    message: parsedError.message,
    statusCode: parsedError.statusCode,
    details: parsedError.details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Handle API response errors
 */
export async function handleApiResponse(response: Response) {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    
    throw new S3R2UIError(
      errorData.code || ERROR_CODES.INTERNAL_ERROR,
      errorData.message || ERROR_MESSAGES[ERROR_CODES.INTERNAL_ERROR],
      response.status,
      errorData
    );
  }
  
  return response;
}
