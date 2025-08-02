import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Since we no longer use invitations (members are added directly), return empty array
    const invitations: any[] = [];

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { invitationId, action } = body;

    if (!invitationId || !["accept", "decline"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid invitation ID or action" },
        { status: 400 }
      );
    }

    // Find the invitation
    const invitation = await prisma.bucketMember.findFirst({
      where: {
        id: invitationId,
        userId: session.user.id,
        acceptedAt: null,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found or already processed" },
        { status: 404 }
      );
    }

    if (action === "accept") {
      // Accept the invitation
      const updatedInvitation = await prisma.bucketMember.update({
        where: { id: invitationId },
        data: { acceptedAt: new Date() },
        include: {
          bucket: {
            select: {
              id: true,
              name: true,
              provider: true,
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

      return NextResponse.json({ 
        message: "Invitation accepted successfully",
        invitation: updatedInvitation 
      });
    } else {
      // Decline the invitation (delete it)
      await prisma.bucketMember.delete({
        where: { id: invitationId },
      });

      return NextResponse.json({ 
        message: "Invitation declined successfully" 
      });
    }
  } catch (error) {
    console.error("Error processing invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
