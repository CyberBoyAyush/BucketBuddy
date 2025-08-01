import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptCredentialsWithPassword } from "@/lib/encryption";
import { headers } from "next/headers";

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
    
    // Only allow bucket owners to get edit data (includes credentials)
    const bucket = await prisma.bucket.findFirst({
      where: {
        id: bucketId,
        ownerId: session.user.id, // Only owner can edit
      },
    });

    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket not found or access denied" },
        { status: 404 }
      );
    }

    // Decrypt credentials for editing with password
    try {
      const { accessKey, secretKey } = decryptCredentialsWithPassword(
        bucket.encryptedAccessKey,
        bucket.encryptedSecretKey,
        password
      );

      // Return bucket data with decrypted credentials for editing
      const editableBucket = {
        id: bucket.id,
        name: bucket.name,
        provider: bucket.provider,
        region: bucket.region,
        endpoint: bucket.endpoint || "",
        bucketName: bucket.bucketName,
        accessKey,
        secretKey,
        encryptionPassword: password, // Include password for form
      };

      return NextResponse.json({ bucket: editableBucket });
    } catch (decryptError) {
      return NextResponse.json(
        { error: "Invalid password - unable to decrypt credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error fetching bucket for editing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
