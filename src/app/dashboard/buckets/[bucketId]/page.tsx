"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { FileBrowser } from "@/components/files/FileBrowser";
import { ArrowLeft, Settings, Users } from "lucide-react";
import Link from "next/link";

interface Bucket {
  id: string;
  name: string;
  provider: string;
  bucketName: string;
  region: string;
  isOwner: boolean;
}

export default function BucketPage() {
  const params = useParams();
  const bucketId = params.bucketId as string;
  const [bucket, setBucket] = useState<Bucket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBucket = async () => {
      try {
        const response = await fetch(`/api/buckets/${bucketId}`);
        if (response.ok) {
          const { bucket } = await response.json();
          setBucket(bucket);
        }
      } catch (error) {
        console.error("Error fetching bucket:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBucket();
  }, [bucketId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!bucket) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-white mb-2">Bucket not found</h3>
          <Link href="/dashboard/buckets" className="text-blue-400 hover:text-blue-300">
            Back to buckets
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/buckets"
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">{bucket.name}</h1>
              <p className="text-gray-400">
                {bucket.provider.toUpperCase()} • {bucket.bucketName} • {bucket.region}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link
              href={`/dashboard/buckets/${bucketId}/members`}
              className="inline-flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Users className="h-4 w-4 mr-2" />
              Members
            </Link>
            {bucket.isOwner && (
              <Link
                href={`/dashboard/buckets/${bucketId}/settings`}
                className="inline-flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            )}
          </div>
        </div>

        {/* File Browser */}
        <FileBrowser bucketId={bucketId} />
      </div>
    </DashboardLayout>
  );
}
