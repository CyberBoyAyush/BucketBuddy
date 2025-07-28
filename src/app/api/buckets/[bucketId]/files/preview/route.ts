import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { decrypt } from "@/lib/encryption";
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
    const { searchParams } = new URL(request.url);
    const objectKey = searchParams.get('key');

    if (!objectKey) {
      return NextResponse.json({ error: "Object key is required" }, { status: 400 });
    }

    // Get bucket configuration
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

    // Decrypt credentials
    const accessKey = decrypt(bucket.encryptedAccessKey);
    const secretKey = decrypt(bucket.encryptedSecretKey);

    // Create S3 client
    const s3Client = new S3Client({
      region: bucket.region,
      endpoint: bucket.endpoint || undefined,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: bucket.provider !== "aws",
    });

    // Check if the file is an image
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const isImage = imageExtensions.some(ext => 
      objectKey.toLowerCase().endsWith(ext)
    );

    if (!isImage) {
      return NextResponse.json({ error: "Not an image file" }, { status: 400 });
    }

    // Generate a signed URL for the image
    const command = new GetObjectCommand({
      Bucket: bucket.bucketName,
      Key: objectKey,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    // Redirect to the signed URL
    return NextResponse.redirect(signedUrl);

  } catch (error) {
    console.error("Error generating image preview:", error);
    return NextResponse.json(
      { error: "Failed to generate image preview" },
      { status: 500 }
    );
  }
}
