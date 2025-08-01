import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptCredentialsWithPassword, hashPassword } from "@/lib/encryption";
import { S3Service } from "@/lib/s3-service";
import { headers } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bucketId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bucketId } = await params;
    console.log('Looking for bucket:', bucketId);

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
      },
    });

    if (!bucket) {
      console.log('Bucket not found:', bucketId);
      return NextResponse.json({ error: "Bucket not found" }, { status: 404 });
    }

    console.log('Bucket found:', bucket.id, bucket.name);

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
      members: bucket.members,
      isOwner: bucket.ownerId === session.user.id,
    };

    return NextResponse.json({ bucket: safeBucket });
  } catch (error) {
    console.error("Error fetching bucket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bucketId: string }> }
) {
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
      encryptionPassword,
    } = body;
    const { bucketId } = await params;

    // Check if user owns the bucket
    const bucket = await prisma.bucket.findFirst({
      where: {
        id: bucketId,
        ownerId: session.user.id,
      },
    });

    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket not found or access denied" },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!name || !provider || !region || !accessKey || !secretKey || !bucketName || !encryptionPassword) {
      return NextResponse.json(
        { error: "Missing required fields including encryption password" },
        { status: 400 }
      );
    }

    // Test connection before updating
    const testService = new S3Service({
      accessKey,
      secretKey,
      region,
      endpoint: endpoint || undefined,
      bucketName,
    });

    try {
      await testService.listObjects("", undefined, 1); // Test with minimal request
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to connect to bucket. Please check your credentials and configuration." },
        { status: 400 }
      );
    }

    // Encrypt credentials with password
    const { encryptedAccessKey, encryptedSecretKey } = encryptCredentialsWithPassword(
      accessKey,
      secretKey,
      encryptionPassword
    );
    const passwordHash = hashPassword(encryptionPassword);

    // Update bucket
    const updatedBucket = await prisma.bucket.update({
      where: { id: bucketId },
      data: {
        name,
        provider,
        region,
        endpoint: endpoint || null,
        bucketName,
        encryptedAccessKey,
        encryptedSecretKey,
        passwordHash,
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
      id: updatedBucket.id,
      name: updatedBucket.name,
      provider: updatedBucket.provider,
      region: updatedBucket.region,
      endpoint: updatedBucket.endpoint,
      bucketName: updatedBucket.bucketName,
      createdAt: updatedBucket.createdAt,
      updatedAt: updatedBucket.updatedAt,
      owner: updatedBucket.owner,
      isOwner: true,
    };

    return NextResponse.json({ bucket: safeBucket });
  } catch (error) {
    console.error("Error updating bucket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ bucketId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bucketId } = await params;
    // Check if user owns the bucket
    const bucket = await prisma.bucket.findFirst({
      where: {
        id: bucketId,
        ownerId: session.user.id,
      },
    });

    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket not found or access denied" },
        { status: 404 }
      );
    }

    // Delete bucket (this will cascade delete members due to foreign key constraints)
    await prisma.bucket.delete({
      where: { id: bucketId },
    });

    return NextResponse.json({ message: "Bucket deleted successfully" });
  } catch (error) {
    console.error("Error deleting bucket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
