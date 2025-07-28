"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Database, Plus, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useBuckets } from "@/hooks/useBuckets";
import { useSelectedBucket } from "@/hooks/useSelectedBucket";

interface Bucket {
  id: string;
  name: string;
  provider: string;
  bucketName: string;
  memberCount: number;
}

interface BucketPermissions {
  role: string;
  isOwner: boolean;
  canRead: boolean;
  canWrite: boolean;
  canAdmin: boolean;
}

export function NavbarBucketSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [permissions, setPermissions] = useState<BucketPermissions | null>(null);
  const { buckets, loading, error } = useBuckets();
  const { selectedBucket, setSelectedBucket } = useSelectedBucket();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (buckets.length > 0 && !selectedBucket) {
      setSelectedBucket(buckets[0]);
    }
  }, [buckets, selectedBucket, setSelectedBucket]);

  useEffect(() => {
    if (selectedBucket) {
      fetchPermissions(selectedBucket.id);
    }
  }, [selectedBucket]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchPermissions = async (bucketId: string) => {
    try {
      const response = await fetch(`/api/buckets/${bucketId}/permissions`);
      if (response.ok) {
        const { permissions } = await response.json();
        setPermissions(permissions);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const getProviderIcon = (provider: string) => {
    const iconClass = "h-4 w-4 text-white";
    switch (provider) {
      case "aws":
        return <Database className={`${iconClass}`} />;
      case "cloudflare":
        return <Database className={`${iconClass}`} />;
      case "digitalocean":
        return <Database className={`${iconClass}`} />;
      default:
        return <Database className={`${iconClass}`} />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "aws":
        return "bg-orange-500";
      case "cloudflare":
        return "hetzner-red-bg";
      case "digitalocean":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="h-9 w-48 bg-white/5 rounded-lg animate-pulse"></div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white/5 hetzner-hover rounded-lg transition-colors duration-150 hetzner-border"
      >
        <Database className="h-4 w-4 hetzner-red" />
        <span className="hetzner-text font-medium text-sm">
          {selectedBucket ? selectedBucket.name : "Select Bucket"}
        </span>
        <ChevronDown className="h-4 w-4 hetzner-text-muted" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 hetzner-card rounded-lg shadow-xl py-2 z-50">
          <div className="px-4 py-3 border-b hetzner-border">
            <p className="text-xs hetzner-text-muted uppercase tracking-wide font-medium">Your Buckets</p>
          </div>

          {buckets.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <div className="p-3 bg-white/5 rounded-lg w-fit mx-auto mb-3">
                <Database className="h-8 w-8 hetzner-text-muted" />
              </div>
              <p className="hetzner-text-muted text-sm mb-3">No buckets configured</p>
              <Link
                href="/dashboard/buckets/add"
                className="inline-flex items-center hetzner-red hover:text-red-300 text-sm transition-colors duration-150 font-medium"
                onClick={() => setIsOpen(false)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add your first bucket
              </Link>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {buckets.map((bucket) => (
                <Link
                  key={bucket.id}
                  href={`/dashboard/buckets/${bucket.id}`}
                  onClick={() => {
                    setSelectedBucket(bucket);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hetzner-hover transition-colors duration-150 ${
                    selectedBucket?.id === bucket.id ? "bg-red-500/10 border-r-2 border-red-500" : ""
                  }`}
                >
                  <div className={`w-8 h-8 ${getProviderColor(bucket.provider)} rounded-lg flex items-center justify-center shadow-sm`}>
                    {getProviderIcon(bucket.provider)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="hetzner-text font-medium truncate text-sm">{bucket.name}</p>
                    <p className="hetzner-text-subtle text-xs truncate">
                      {bucket.provider.toUpperCase()} • {bucket.memberCount} member{bucket.memberCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {selectedBucket?.id === bucket.id && (
                    <div className="w-2 h-2 hetzner-red-bg rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>
          )}

          <div className="border-t hetzner-border mt-2 pt-2">
            {/* Bucket-specific actions */}
            {selectedBucket && permissions?.canAdmin && (
              <>
                <Link
                  href={`/dashboard/buckets/${selectedBucket.id}/settings`}
                  className="flex items-center space-x-3 px-4 py-2.5 hetzner-text-muted hover:hetzner-text hetzner-hover transition-colors duration-150"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Bucket Settings</span>
                </Link>

                <Link
                  href={`/dashboard/buckets/${selectedBucket.id}/members`}
                  className="flex items-center space-x-3 px-4 py-2.5 hetzner-text-muted hover:hetzner-text hetzner-hover transition-colors duration-150"
                  onClick={() => setIsOpen(false)}
                >
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Manage Members</span>
                </Link>

                <div className="border-t hetzner-border my-2" />
              </>
            )}

            {/* Global actions */}
            <Link
              href="/dashboard/buckets/add"
              className="flex items-center space-x-3 px-4 py-2.5 hetzner-text hover:text-red-300 hetzner-hover transition-colors duration-150"
              onClick={() => setIsOpen(false)}
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Add New Bucket</span>
            </Link>

            <Link
              href="/dashboard/buckets"
              className="flex items-center space-x-3 px-4 py-2.5 hetzner-text-muted hover:hetzner-text hetzner-hover transition-colors duration-150"
              onClick={() => setIsOpen(false)}
            >
              <Database className="h-4 w-4" />
              <span className="text-sm">Manage All</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
