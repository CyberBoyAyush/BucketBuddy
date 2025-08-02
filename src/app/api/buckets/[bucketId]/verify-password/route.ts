import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword, decryptCredentialsWithPassword } from "@/lib/encryption";
import { headers } from "next/headers";
import { applyRateLimit, getClientIP, createRateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limiter";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bucketId: string }> }
) {
  try {
    // Apply rate limiting for password verification (brute force protection)
    const clientIP = getClientIP(request);
    const rateLimit = applyRateLimit(clientIP, RATE_LIMITS.PASSWORD_VERIFY);

    if (!rateLimit.allowed) {
      const headers = createRateLimitHeaders(
        rateLimit.remaining,
        rateLimit.resetTime,
        RATE_LIMITS.PASSWORD_VERIFY.maxRequests
      );

      return NextResponse.json(
        { error: "Too many password attempts. Please try again later." },
        { status: 429, headers }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { password } = body;
    const { bucketId } = await params;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Find bucket and check access
    const bucket = await prisma.bucket.findFirst({
      where: {
        id: bucketId,
        OR: [
          { ownerId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
                acceptedAt: { not: null },
              },
            },
          },
        ],
      },
    });

    if (!bucket) {
      return NextResponse.json({ error: "Bucket not found" }, { status: 404 });
    }

    // Verify password using stored hash if available, otherwise try decryption
    if (bucket.passwordHash) {
      const isValidPassword = verifyPassword(password, bucket.passwordHash);
      if (isValidPassword) {
        return NextResponse.json({
          success: true,
          message: "Password verified successfully"
        });
      } else {
        return NextResponse.json({
          success: false,
          error: "Invalid password"
        }, { status: 401 });
      }
    } else {
      // Fallback to decryption verification for buckets without password hash
      try {
        decryptCredentialsWithPassword(
          bucket.encryptedAccessKey,
          bucket.encryptedSecretKey,
          password
        );

        return NextResponse.json({
          success: true,
          message: "Password verified successfully"
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: "Invalid password"
        }, { status: 401 });
      }
    }

  } catch (error) {
    return NextResponse.json(
      { error: "Password verification failed" },
      { status: 500 }
    );
  }
}
