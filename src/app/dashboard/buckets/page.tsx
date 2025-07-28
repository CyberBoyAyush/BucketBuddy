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
        return { name: "Amazon S3", color: "bg-orange-500", icon: <Database className="h-5 w-5 text-white" /> };
      case "cloudflare":
        return { name: "Cloudflare R2", color: "hetzner-red-bg", icon: <Database className="h-5 w-5 text-white" /> };
      case "digitalocean":
        return { name: "DigitalOcean Spaces", color: "bg-blue-500", icon: <Database className="h-5 w-5 text-white" /> };
      default:
        return { name: "Unknown", color: "bg-gray-500", icon: <Database className="h-5 w-5 text-white" /> };
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 hetzner-red"></div>
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
            <h1 className="text-2xl font-bold hetzner-text">Buckets</h1>
            <p className="hetzner-text-muted">Manage your S3 and R2 storage buckets</p>
          </div>
          <Link
            href="/dashboard/buckets/add"
            className="inline-flex items-center px-4 py-2 hetzner-btn-primary rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Bucket
          </Link>
        </div>

        {/* Buckets Grid */}
        {buckets.length === 0 ? (
          <div className="text-center py-12">
            <Database className="h-16 w-16 hetzner-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold hetzner-text mb-2">No buckets configured</h3>
            <p className="hetzner-text-muted mb-6">
              Get started by adding your first S3 or R2 bucket
            </p>
            <Link
              href="/dashboard/buckets/add"
              className="inline-flex items-center px-6 py-3 hetzner-btn-primary rounded-lg transition-colors"
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
                  className="hetzner-card rounded-xl p-6 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-200 group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${providerInfo.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        {providerInfo.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold hetzner-text group-hover:text-white transition-colors">
                          {bucket.name}
                        </h3>
                        <p className="text-sm hetzner-text-muted">{providerInfo.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/dashboard/buckets/${bucket.id}/settings`}
                        className="p-2 hetzner-text-muted hover:hetzner-text hetzner-hover rounded-lg transition-colors"
                        title="Bucket Settings"
                      >
                        <Settings className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mb-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 hetzner-text-muted" />
                          <span className="text-sm hetzner-text-muted">Members</span>
                        </div>
                        <span className="text-lg font-semibold hetzner-text">{bucket.memberCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="hetzner-text-muted">Bucket Name:</span>
                      <span className="hetzner-text font-mono text-xs bg-white/5 px-2 py-1 rounded">
                        {bucket.bucketName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="hetzner-text-muted">Region:</span>
                      <span className="hetzner-text font-medium">{bucket.region}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="hetzner-text-muted">Created:</span>
                      <span className="hetzner-text-subtle text-xs">
                        {new Date(bucket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/dashboard/buckets/${bucket.id}`}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2.5 hetzner-btn-primary text-sm rounded-lg transition-all duration-150 shadow-md hover:shadow-lg"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Browse Files
                    </Link>
                    <Link
                      href={`/dashboard/buckets/${bucket.id}/members`}
                      className="inline-flex items-center justify-center px-3 py-2.5 hetzner-btn-secondary rounded-lg transition-colors"
                      title="Manage Members"
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
