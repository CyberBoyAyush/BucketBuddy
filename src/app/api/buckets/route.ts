import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptCredentials } from "@/lib/encryption";
import { S3Service } from "@/lib/s3-service";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
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
    } = body;

    // Validate required fields
    if (!name || !provider || !region || !accessKey || !secretKey || !bucketName) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Encrypt credentials
    const { encryptedAccessKey, encryptedSecretKey } = encryptCredentials(
      accessKey,
      secretKey
    );

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

    // Create bucket
    const bucket = await prisma.bucket.create({
      data: {
        name,
        provider,
        region,
        endpoint,
        encryptedAccessKey,
        encryptedSecretKey,
        bucketName,
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
