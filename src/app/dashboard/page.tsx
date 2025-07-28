"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Plus, Database, Users, Activity } from "lucide-react";
import Link from "next/link";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useBuckets } from "@/hooks/useBuckets";
import { FileBrowser } from "@/components/files/FileBrowser";
import { useSelectedBucket } from "@/hooks/useSelectedBucket";

interface Bucket {
  id: string;
  name: string;
  provider: string;
  bucketName: string;
  memberCount: number;
}

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const { buckets, loading, error } = useBuckets();
  const { selectedBucket } = useSelectedBucket();

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Middleware will redirect
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">


        {/* Main Content */}
        {buckets.length === 0 ? (
          /* No Buckets - Getting Started */
          <div className="bg-black border border-white/10 rounded-lg p-8 text-center">
            <Database className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Get Started with S3R2UI</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Connect your first S3 or R2 bucket to start managing your cloud storage files with ease.
            </p>
            <div className="space-y-4">
              <Link
                href="/dashboard/buckets/add"
                className="inline-flex items-center px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-lg transition-colors duration-150 text-lg font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Bucket
              </Link>
              <div className="text-sm text-gray-600">
                Supports AWS S3, Cloudflare R2, DigitalOcean Spaces, and more
              </div>
            </div>
          </div>
        ) : selectedBucket ? (
          /* Show File Browser for Selected Bucket */
          <FileBrowser bucketId={selectedBucket.id} />
        ) : (
          /* No Bucket Selected */
          <div className="bg-black border border-white/10 rounded-lg p-8 text-center">
            <Database className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Select a Bucket</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Choose a bucket from the dropdown in the navbar to start managing your files.
            </p>
            <Link
              href="/dashboard/buckets"
              className="inline-flex items-center px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-lg transition-colors duration-150 text-lg font-medium"
            >
              <Database className="h-5 w-5 mr-2" />
              Manage All Buckets
            </Link>
          </div>
        )}


      </div>
    </DashboardLayout>
  );
}
