import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createS3ServiceFromBucket } from "@/lib/s3-service";
import { hasPermission } from "@/lib/utils";
import { headers } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bucketId: string; operation: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { password } = body;
    const { bucketId, operation } = await params;

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

    // Create S3 service with password
    let s3Service;
    try {
      s3Service = createS3ServiceFromBucket({
        encryptedAccessKey: bucket.encryptedAccessKey,
        encryptedSecretKey: bucket.encryptedSecretKey,
        region: bucket.region,
        endpoint: bucket.endpoint || undefined,
        bucketName: bucket.bucketName,
      }, password);
    } catch (decryptError) {
      return NextResponse.json(
        { error: "Invalid password - unable to decrypt bucket credentials" },
        { status: 401 }
      );
    }

    switch (operation) {
      case "rename":
      case "move": {
        const { sourceKey, destinationKey } = body;

        if (!sourceKey || !destinationKey) {
          return NextResponse.json(
            { error: "Source key and destination key are required" },
            { status: 400 }
          );
        }

        // Copy object to new location
        await s3Service.copyObject(sourceKey, destinationKey);
        
        // Delete original object
        await s3Service.deleteObject(sourceKey);

        return NextResponse.json({
          message: `File ${operation === "rename" ? "renamed" : "moved"} successfully`,
        });
      }

      case "copy": {
        const { sourceKey, destinationKey } = body;

        if (!sourceKey || !destinationKey) {
          return NextResponse.json(
            { error: "Source key and destination key are required" },
            { status: 400 }
          );
        }

        // Copy object to new location
        await s3Service.copyObject(sourceKey, destinationKey);

        return NextResponse.json({
          message: "File copied successfully",
        });
      }

      case "download-url": {
        const { key, expiresIn } = body;

        if (!key) {
          return NextResponse.json(
            { error: "File key is required" },
            { status: 400 }
          );
        }

        // Check if user has read permission
        if (!hasPermission(userRole, "read")) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const downloadUrl = await s3Service.getDownloadUrl(key, expiresIn || 3600);

        return NextResponse.json({ downloadUrl });
      }

      case "metadata": {
        const { key } = body;

        if (!key) {
          return NextResponse.json(
            { error: "File key is required" },
            { status: 400 }
          );
        }

        // Check if user has read permission
        if (!hasPermission(userRole, "read")) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const metadata = await s3Service.getObjectMetadata(key);

        return NextResponse.json({ metadata });
      }

      case "create-folder": {
        const { folderName, path } = body;

        if (!folderName) {
          return NextResponse.json(
            { error: "Folder name is required" },
            { status: 400 }
          );
        }

        // Check if user has write permission
        if (!hasPermission(userRole, "write")) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Sanitize folder name
        const sanitizedFolderName = folderName.replace(/[^a-zA-Z0-9\-_\s]/g, '').trim();
        if (!sanitizedFolderName) {
          return NextResponse.json(
            { error: "Invalid folder name" },
            { status: 400 }
          );
        }

        // Create folder key with trailing slash
        const folderKey = path ? `${path}${sanitizedFolderName}/` : `${sanitizedFolderName}/`;

        // Create an empty object to represent the folder
        await s3Service.createFolder(folderKey);

        return NextResponse.json({
          message: "Folder created successfully",
          folderKey,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid operation" },
          { status: 400 }
        );
    }
  } catch (error) {
    const { operation } = await params;
    console.error(`Error performing ${operation} operation:`, error);
    return NextResponse.json(
      { error: `Failed to ${operation} file` },
      { status: 500 }
    );
  }
}
