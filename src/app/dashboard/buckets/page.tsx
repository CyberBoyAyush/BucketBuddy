"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Plus, Database, Settings, Users, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Bucket {
  id: string;
  name: string;
  provider: string;
  bucketName: string;
  region: string;
  createdAt: string;
  memberCount: number;
  fileCount: number;
  storageUsed: string;
}

export default function BucketsPage() {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        const response = await fetch("/api/buckets");
        if (response.ok) {
          const { buckets } = await response.json();
          setBuckets(buckets);
        }
      } catch (error) {
        console.error("Error fetching buckets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuckets();
  }, []);

  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case "aws":
        return { name: "Amazon S3", color: "bg-orange-500", icon: "🟠" };
      case "cloudflare":
        return { name: "Cloudflare R2", color: "bg-yellow-500", icon: "🟡" };
      case "digitalocean":
        return { name: "DigitalOcean Spaces", color: "bg-blue-500", icon: "🔵" };
      default:
        return { name: "Unknown", color: "bg-gray-500", icon: "⚪" };
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Buckets</h1>
            <p className="text-gray-400">Manage your S3 and R2 storage buckets</p>
          </div>
          <Link
            href="/dashboard/buckets/add"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Bucket
          </Link>
        </div>

        {/* Buckets Grid */}
        {buckets.length === 0 ? (
          <div className="text-center py-12">
            <Database className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No buckets configured</h3>
            <p className="text-gray-400 mb-6">
              Get started by adding your first S3 or R2 bucket
            </p>
            <Link
              href="/dashboard/buckets/add"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Bucket
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buckets.map((bucket) => {
              const providerInfo = getProviderInfo(bucket.provider);
              return (
                <div
                  key={bucket.id}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${providerInfo.color} rounded-lg flex items-center justify-center`}>
                        <span className="text-lg">{providerInfo.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{bucket.name}</h3>
                        <p className="text-sm text-gray-400">{providerInfo.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/dashboard/buckets/${bucket.id}/settings`}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Members</p>
                      <p className="text-lg font-semibold text-white">{bucket.memberCount}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Bucket Name:</span>
                      <span className="text-white font-mono text-xs">{bucket.bucketName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Region:</span>
                      <span className="text-white">{bucket.region}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/buckets/${bucket.id}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Browse Files
                    </Link>
                    <Link
                      href={`/dashboard/buckets/${bucket.id}/members`}
                      className="inline-flex items-center justify-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                    >
                      <Users className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
