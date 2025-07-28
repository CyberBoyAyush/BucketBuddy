import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    try {
      // Use Better Auth's changePassword method
      await auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
        },
        headers: await headers(),
      });
    } catch (error: any) {
      // Handle Better Auth specific errors
      if (error.message?.includes("Invalid password") || error.message?.includes("incorrect")) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      throw error; // Re-throw if it's not a password validation error
    }

    return NextResponse.json({ 
      message: "Password updated successfully" 
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
