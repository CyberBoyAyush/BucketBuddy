/**
 * Simple in-memory rate limiter for API endpoints
 * Relaxed limits but brute force safe
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if request is within rate limit
   * @param identifier - Usually IP address or user ID
   * @param windowMs - Time window in milliseconds
   * @param maxRequests - Maximum requests per window
   * @returns true if within limit, false if exceeded
   */
  isAllowed(identifier: string, windowMs: number, maxRequests: number): boolean {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.store.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemaining(identifier: string, maxRequests: number): number {
    const entry = this.store.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return maxRequests;
    }
    return Math.max(0, maxRequests - entry.count);
  }

  /**
   * Get reset time for identifier
   */
  getResetTime(identifier: string): number {
    const entry = this.store.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return 0;
    }
    return entry.resetTime;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear all entries (for testing)
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Destroy the rate limiter
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

/**
 * Rate limiting configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Authentication endpoints - stricter limits
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 attempts per 15 minutes (brute force safe)
  },
  
  // Password verification - strict for brute force protection
  PASSWORD_VERIFY: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  },
  
  // General API endpoints - relaxed but safe
  API: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
  
  // File operations - more generous for file uploads/downloads
  FILES: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 50, // 50 file operations per minute
  },
  
  // Admin operations - moderate limits
  ADMIN: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 20, // 20 admin operations per 5 minutes
  },
} as const;

/**
 * Apply rate limiting to a request
 * @param identifier - Usually IP address or user ID
 * @param limit - Rate limit configuration
 * @returns { allowed: boolean, remaining: number, resetTime: number }
 */
export function applyRateLimit(
  identifier: string,
  limit: { windowMs: number; maxRequests: number }
) {
  const allowed = rateLimiter.isAllowed(identifier, limit.windowMs, limit.maxRequests);
  const remaining = rateLimiter.getRemaining(identifier, limit.maxRequests);
  const resetTime = rateLimiter.getResetTime(identifier);

  return {
    allowed,
    remaining,
    resetTime,
  };
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Check various headers for IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to a default IP if none found
  return '127.0.0.1';
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(
  remaining: number,
  resetTime: number,
  limit: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
  };
}

export default rateLimiter;
