import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

    // Decrypt credentials for editing
    const decryptedAccessKey = decrypt(bucket.encryptedAccessKey);
    const decryptedSecretKey = decrypt(bucket.encryptedSecretKey);

    // Return bucket data with decrypted credentials for editing
    const editableBucket = {
      id: bucket.id,
      name: bucket.name,
      provider: bucket.provider,
      region: bucket.region,
      endpoint: bucket.endpoint || "",
      bucketName: bucket.bucketName,
      accessKey: decryptedAccessKey,
      secretKey: decryptedSecretKey,
    };

    return NextResponse.json({ bucket: editableBucket });
  } catch (error) {
    console.error("Error fetching bucket for editing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
