import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { S3Service } from "@/lib/s3-service";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { provider, region, endpoint, accessKey, secretKey, bucketName } = body;

    // Validate required fields
    if (!provider || !region || !accessKey || !secretKey || !bucketName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create S3 service instance
    const s3Service = new S3Service({
      accessKey,
      secretKey,
      region,
      endpoint: endpoint || undefined,
      bucketName,
    });

    // Test connection
    const isConnected = await s3Service.testConnection();

    if (isConnected) {
      // If connection is successful, try to list a few objects to verify permissions
      try {
        await s3Service.listObjects("", undefined, 1);
        return NextResponse.json({
          success: true,
          message: "Connection successful! Bucket is accessible.",
        });
      } catch (error) {
        return NextResponse.json({
          success: true,
          message: "Connection successful, but limited permissions detected. You may not be able to list or manage files.",
          warning: true,
        });
      }
    } else {
      return NextResponse.json({
        success: false,
        message: "Failed to connect to bucket. Please check your credentials, bucket name, and permissions.",
      });
    }
  } catch (error) {
    console.error("Error testing bucket connection:", error);
    
    // Provide more specific error messages based on the error type
    let errorMessage = "Failed to connect to bucket. Please check your configuration.";
    
    if (error instanceof Error) {
      if (error.message.includes("NoSuchBucket")) {
        errorMessage = "Bucket not found. Please check the bucket name.";
      } else if (error.message.includes("InvalidAccessKeyId")) {
        errorMessage = "Invalid access key. Please check your credentials.";
      } else if (error.message.includes("SignatureDoesNotMatch")) {
        errorMessage = "Invalid secret key. Please check your credentials.";
      } else if (error.message.includes("AccessDenied")) {
        errorMessage = "Access denied. Please check your bucket permissions.";
      } else if (error.message.includes("NetworkingError")) {
        errorMessage = "Network error. Please check your endpoint URL and internet connection.";
      }
    }

    return NextResponse.json({
      success: false,
      message: errorMessage,
    });
  }
}
