import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { decryptCredentialsWithPassword } from "@/lib/encryption";

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
    const { password } = body;
    const { bucketId } = await params;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required to decrypt credentials" },
        { status: 400 }
      );
    }

    // Find bucket and check if user has admin permissions
    const bucket = await prisma.bucket.findFirst({
      where: {
        id: bucketId,
        OR: [
          { ownerId: session.user.id }, // Owner
          {
            members: {
              some: {
                userId: session.user.id,
                role: "admin",
                acceptedAt: { not: null },
              },
            },
          }, // Admin member
        ],
      },
    });

    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket not found or insufficient permissions" },
        { status: 404 }
      );
    }

    // Decrypt credentials for admin viewing
    try {
      console.log('Attempting to decrypt credentials for admin...');
      const { accessKey, secretKey } = decryptCredentialsWithPassword(
        bucket.encryptedAccessKey,
        bucket.encryptedSecretKey,
        password
      );

      console.log('Decryption successful, accessKey length:', accessKey?.length);
      console.log('Decryption successful, secretKey length:', secretKey?.length);

      // Return bucket data with decrypted credentials for admin viewing
      const adminBucketData = {
        id: bucket.id,
        name: bucket.name,
        provider: bucket.provider,
        region: bucket.region,
        endpoint: bucket.endpoint || "",
        bucketName: bucket.bucketName,
        accessKey,
        secretKey,
        encryptionPassword: password, // Show the encryption password to admins
      };

      console.log('Returning admin bucket data:', { ...adminBucketData, accessKey: '***', secretKey: '***', encryptionPassword: '***' });
      return NextResponse.json({ bucket: adminBucketData });
    } catch (decryptError) {
      return NextResponse.json(
        { error: "Invalid password - unable to decrypt credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error getting admin credentials:", error);
    return NextResponse.json(
      { error: "Failed to get credentials" },
      { status: 500 }
    );
  }
}
