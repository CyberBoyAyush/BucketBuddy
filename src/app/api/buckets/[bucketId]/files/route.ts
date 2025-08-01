import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createS3ServiceFromBucket } from "@/lib/s3-service";
import { hasPermission } from "@/lib/utils";
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

    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get("prefix") || "";
    const continuationToken = searchParams.get("continuationToken") || undefined;
    const maxKeys = parseInt(searchParams.get("maxKeys") || "1000");
    const password = searchParams.get("password");
    const { bucketId } = await params;

    // Find bucket and check permissions
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
        members: {
          where: {
            userId: session.user.id,
            acceptedAt: { not: null },
          },
        },
      },
    });

    if (!bucket) {
      return NextResponse.json({ error: "Bucket not found" }, { status: 404 });
    }

    // Check if user has read permission
    const isOwner = bucket.ownerId === session.user.id;
    const userRole = isOwner ? "admin" : bucket.members[0]?.role || "viewer";

    if (!hasPermission(userRole, "read")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if password is required for encrypted bucket
    if (!password) {
      return NextResponse.json({
        error: "Password required to access encrypted bucket"
      }, { status: 401 });
    }

    // Create S3 service with password and list objects
    try {
      const s3Service = createS3ServiceFromBucket({
        encryptedAccessKey: bucket.encryptedAccessKey,
        encryptedSecretKey: bucket.encryptedSecretKey,
        region: bucket.region,
        endpoint: bucket.endpoint || undefined,
        bucketName: bucket.bucketName,
      }, password);
      const result = await s3Service.listObjects(prefix, continuationToken, maxKeys);

      return NextResponse.json({
        objects: result.objects,
        continuationToken: result.continuationToken,
        isTruncated: result.isTruncated,
        prefix,
      });
    } catch (decryptError) {
      console.error("Error decrypting credentials:", decryptError);
      return NextResponse.json(
        { error: "Invalid password - unable to decrypt bucket credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error listing files:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const { key, contentType, password } = body;
    const { bucketId } = await params;

    if (!key) {
      return NextResponse.json(
        { error: "File key is required" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json({
        error: "Password required to access encrypted bucket"
      }, { status: 401 });
    }

    // Find bucket and check permissions
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
        members: {
          where: {
            userId: session.user.id,
            acceptedAt: { not: null },
          },
        },
      },
    });

    if (!bucket) {
      return NextResponse.json({ error: "Bucket not found" }, { status: 404 });
    }

    // Check if user has write permission
    const isOwner = bucket.ownerId === session.user.id;
    const userRole = isOwner ? "admin" : bucket.members[0]?.role || "viewer";

    if (!hasPermission(userRole, "write")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Create S3 service with password and generate upload URL
    try {
      const s3Service = createS3ServiceFromBucket({
        encryptedAccessKey: bucket.encryptedAccessKey,
        encryptedSecretKey: bucket.encryptedSecretKey,
        region: bucket.region,
        endpoint: bucket.endpoint || undefined,
        bucketName: bucket.bucketName,
      }, password);
      const uploadUrl = await s3Service.getUploadUrl(key, contentType);

      return NextResponse.json({ uploadUrl });
    } catch (decryptError) {
      return NextResponse.json(
        { error: "Invalid password - unable to decrypt bucket credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
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

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const password = searchParams.get("password");
    const { bucketId } = await params;

    if (!key) {
      return NextResponse.json(
        { error: "File key is required" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json({
        error: "Password required to access encrypted bucket"
      }, { status: 401 });
    }

    // Find bucket and check permissions
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
        members: {
          where: {
            userId: session.user.id,
            acceptedAt: { not: null },
          },
        },
      },
    });

    if (!bucket) {
      return NextResponse.json({ error: "Bucket not found" }, { status: 404 });
    }

    // Check if user has write permission
    const isOwner = bucket.ownerId === session.user.id;
    const userRole = isOwner ? "admin" : bucket.members[0]?.role || "viewer";

    if (!hasPermission(userRole, "write")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Create S3 service with password and delete object
    try {
      const s3Service = createS3ServiceFromBucket({
        encryptedAccessKey: bucket.encryptedAccessKey,
        encryptedSecretKey: bucket.encryptedSecretKey,
        region: bucket.region,
        endpoint: bucket.endpoint || undefined,
        bucketName: bucket.bucketName,
      }, password);
      await s3Service.deleteObject(key);

      return NextResponse.json({ message: "File deleted successfully" });
    } catch (decryptError) {
      return NextResponse.json(
        { error: "Invalid password - unable to decrypt bucket credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
