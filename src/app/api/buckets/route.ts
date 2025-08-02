import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptCredentialsWithPassword, hashPassword } from "@/lib/encryption";
import { S3Service } from "@/lib/s3-service";
import { headers } from "next/headers";
import { applyRateLimit, getClientIP, createRateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limiter";

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting for API endpoints
    const clientIP = getClientIP(request);
    const rateLimit = applyRateLimit(clientIP, RATE_LIMITS.API);

    if (!rateLimit.allowed) {
      const headers = createRateLimitHeaders(
        rateLimit.remaining,
        rateLimit.resetTime,
        RATE_LIMITS.API.maxRequests
      );

      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const buckets = await prisma.bucket.findMany({
      where: {
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
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          where: {
            acceptedAt: { not: null },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: {
              where: {
                acceptedAt: { not: null },
              },
            },
          },
        },
      },
    });

    // Remove encrypted credentials from response
    const safeBuckets = buckets.map((bucket) => ({
      id: bucket.id,
      name: bucket.name,
      provider: bucket.provider,
      region: bucket.region,
      endpoint: bucket.endpoint,
      bucketName: bucket.bucketName,
      createdAt: bucket.createdAt,
      updatedAt: bucket.updatedAt,
      owner: bucket.owner,
      members: bucket.members,
      memberCount: bucket._count.members,
      isOwner: bucket.ownerId === session.user.id,
    }));

    return NextResponse.json({ buckets: safeBuckets });
  } catch (error) {
    console.error("Error fetching buckets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for API endpoints
    const clientIP = getClientIP(request);
    const rateLimit = applyRateLimit(clientIP, RATE_LIMITS.API);

    if (!rateLimit.allowed) {
      const headers = createRateLimitHeaders(
        rateLimit.remaining,
        rateLimit.resetTime,
        RATE_LIMITS.API.maxRequests
      );

      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
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
    const {
      name,
      provider,
      region,
      endpoint,
      accessKey,
      secretKey,
      bucketName,
      encryptionPassword,
    } = body;

    // Validate required fields
    if (!name || !provider || !region || !accessKey || !secretKey || !bucketName || !encryptionPassword) {
      return NextResponse.json(
        { error: "Missing required fields including encryption password" },
        { status: 400 }
      );
    }

    // Test connection before saving
    const testService = new S3Service({
      accessKey,
      secretKey,
      region,
      endpoint: endpoint || undefined,
      bucketName,
    });

    const connectionTest = await testService.testConnection();
    if (!connectionTest) {
      return NextResponse.json(
        { error: "Failed to connect to bucket. Please check your credentials and bucket name." },
        { status: 400 }
      );
    }

    // Encrypt credentials with password and hash the password
    const { encryptedAccessKey, encryptedSecretKey } = encryptCredentialsWithPassword(
      accessKey,
      secretKey,
      encryptionPassword
    );
    const passwordHash = hashPassword(encryptionPassword);

    // Check if bucket already exists for this user
    const existingBucket = await prisma.bucket.findFirst({
      where: {
        ownerId: session.user.id,
        bucketName,
        provider,
      },
    });

    if (existingBucket) {
      return NextResponse.json(
        { error: "A bucket with this name and provider already exists" },
        { status: 409 }
      );
    }

    // Create bucket with password hash
    const bucket = await prisma.bucket.create({
      data: {
        name,
        provider,
        region,
        endpoint,
        encryptedAccessKey,
        encryptedSecretKey,
        bucketName,
        passwordHash,
        ownerId: session.user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Remove encrypted credentials from response
    const safeBucket = {
      id: bucket.id,
      name: bucket.name,
      provider: bucket.provider,
      region: bucket.region,
      endpoint: bucket.endpoint,
      bucketName: bucket.bucketName,
      createdAt: bucket.createdAt,
      updatedAt: bucket.updatedAt,
      owner: bucket.owner,
      isOwner: true,
    };

    return NextResponse.json({ bucket: safeBucket }, { status: 201 });
  } catch (error) {
    console.error("Error creating bucket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
