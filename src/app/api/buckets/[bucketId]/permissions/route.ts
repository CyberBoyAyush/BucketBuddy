import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

    // Determine user role and permissions
    const isOwner = bucket.ownerId === session.user.id;
    const userRole = isOwner ? "admin" : bucket.members[0]?.role || "viewer";

    const permissions = {
      role: userRole,
      isOwner,
      canRead: hasPermission(userRole, "read"),
      canWrite: hasPermission(userRole, "write"),
      canAdmin: hasPermission(userRole, "admin"),
    };

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error("Error getting bucket permissions:", error);
    return NextResponse.json(
      { error: "Failed to get bucket permissions" },
      { status: 500 }
    );
  }
}
