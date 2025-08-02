import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, getClientIP, createRateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limiter";

// Create rate-limited handlers
const originalHandlers = toNextJsHandler(auth);

// Wrap POST handler with rate limiting for auth operations
async function rateLimitedPOST(request: NextRequest) {
  // Apply rate limiting for authentication endpoints
  const clientIP = getClientIP(request);
  const rateLimit = applyRateLimit(clientIP, RATE_LIMITS.AUTH);

  if (!rateLimit.allowed) {
    const headers = createRateLimitHeaders(
      rateLimit.remaining,
      rateLimit.resetTime,
      RATE_LIMITS.AUTH.maxRequests
    );

    return NextResponse.json(
      { error: "Too many authentication attempts. Please try again later." },
      { status: 429, headers }
    );
  }

  // Call original handler
  return originalHandlers.POST(request);
}

export const POST = rateLimitedPOST;
export const GET = originalHandlers.GET;