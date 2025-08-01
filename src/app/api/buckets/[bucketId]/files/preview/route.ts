import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { decryptCredentialsWithPassword } from "@/lib/encryption";
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
    const password = searchParams.get('password');

    if (!objectKey) {
      return NextResponse.json({ error: "Object key is required" }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({
        error: "Password required to access encrypted bucket"
      }, { status: 401 });
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

    // Decrypt credentials with password
    let accessKey, secretKey;
    try {
      const credentials = decryptCredentialsWithPassword(
        bucket.encryptedAccessKey,
        bucket.encryptedSecretKey,
        password
      );
      accessKey = credentials.accessKey;
      secretKey = credentials.secretKey;
    } catch (decryptError) {
      return NextResponse.json(
        { error: "Invalid password - unable to decrypt bucket credentials" },
        { status: 401 }
      );
    }

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

    // Check if the file is previewable
    const previewableExtensions = [
      // Images
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp',
      // Documents
      '.pdf',
      // Videos
      '.mp4', '.webm', '.ogg', '.mov', '.avi',
      // Audio
      '.mp3', '.wav', '.ogg', '.m4a', '.flac',
      // Text
      '.txt', '.md', '.json', '.xml', '.csv', '.log'
    ];

    const isPreviewable = previewableExtensions.some(ext =>
      objectKey.toLowerCase().endsWith(ext)
    );

    if (!isPreviewable) {
      return NextResponse.json({ error: "File type not supported for preview" }, { status: 400 });
    }

    // Get the file extension to determine content type
    const fileExtension = objectKey.toLowerCase().split('.').pop() || '';

    // For text files, we need to fetch and return the content directly
    const textExtensions = ['txt', 'md', 'json', 'xml', 'csv', 'log'];
    if (textExtensions.includes(fileExtension)) {
      try {
        const command = new GetObjectCommand({
          Bucket: bucket.bucketName,
          Key: objectKey,
        });

        const response = await s3Client.send(command);
        const text = await response.Body?.transformToString() || '';

        return new NextResponse(text, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } catch (error) {
        console.error('Error fetching text file:', error);
        return NextResponse.json({ error: "Failed to fetch text file" }, { status: 500 });
      }
    }

    // For other files (images, PDFs, videos, audio), generate a signed URL
    const command = new GetObjectCommand({
      Bucket: bucket.bucketName,
      Key: objectKey,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    // Redirect to the signed URL for direct file access
    return NextResponse.redirect(signedUrl);

  } catch (error) {
    console.error("Error generating file preview:", error);
    return NextResponse.json(
      { error: "Failed to generate file preview" },
      { status: 500 }
    );
  }
}
