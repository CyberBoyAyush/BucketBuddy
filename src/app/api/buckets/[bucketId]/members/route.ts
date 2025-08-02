import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidEmail } from "@/lib/utils";
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
    // Check if user has access to this bucket
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

    // Get all members (including pending invitations)
    const members = await prisma.bucketMember.findMany({
      where: {
        bucketId: bucketId,
      },
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
      orderBy: {
        invitedAt: "desc",
      },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching bucket members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
    const { email, role = "viewer" } = body;
    const { bucketId } = await params;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

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

    // Find the user to invite
    const userToInvite = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!userToInvite) {
      return NextResponse.json(
        { error: "User with this email does not exist" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.bucketMember.findUnique({
      where: {
        bucketId_userId: {
          bucketId: bucketId,
          userId: userToInvite.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this bucket" },
        { status: 409 }
      );
    }

    // Add user directly as member (no verification needed)
    const member = await prisma.bucketMember.create({
      data: {
        bucketId: bucketId,
        userId: userToInvite.id,
        role,
        invitedBy: session.user.id,
        acceptedAt: new Date(), // Accept immediately
      },
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

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error("Error adding member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
