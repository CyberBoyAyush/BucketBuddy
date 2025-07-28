import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bucketId: string; memberId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { role } = body;
    const { bucketId, memberId } = await params;

    if (!["viewer", "editor", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be viewer, editor, or admin" },
        { status: 400 }
      );
    }

    // Check if user owns the bucket or has admin permissions
    const bucket = await prisma.bucket.findFirst({
      where: {
        id: bucketId,
        OR: [
          { ownerId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
                role: "admin",
                acceptedAt: { not: null },
              },
            },
          },
        ],
      },
    });

    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket not found or insufficient permissions" },
        { status: 404 }
      );
    }

    // Update member role
    const updatedMember = await prisma.bucketMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ member: updatedMember });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ bucketId: string; memberId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bucketId, memberId } = await params;
    // Get the member to check permissions
    const member = await prisma.bucketMember.findUnique({
      where: { id: memberId },
      include: {
        bucket: true,
      },
    });

    if (!member || member.bucketId !== bucketId) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check if user can remove this member
    const canRemove = 
      member.bucket.ownerId === session.user.id || // Bucket owner
      member.userId === session.user.id || // User removing themselves
      // Admin removing non-admin member
      (await prisma.bucketMember.findFirst({
        where: {
          bucketId: bucketId,
          userId: session.user.id,
          role: "admin",
          acceptedAt: { not: null },
        },
      })) !== null;

    if (!canRemove) {
      return NextResponse.json(
        { error: "Insufficient permissions to remove this member" },
        { status: 403 }
      );
    }

    // Remove the member
    await prisma.bucketMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
