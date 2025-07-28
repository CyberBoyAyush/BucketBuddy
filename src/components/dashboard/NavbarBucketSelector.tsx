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
    switch (provider) {
      case "aws":
        return "🟠"; // AWS orange
      case "cloudflare":
        return "🟡"; // Cloudflare yellow
      case "digitalocean":
        return "🔵"; // DigitalOcean blue
      default:
        return "⚪";
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
        className="flex items-center space-x-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-150 border border-white/10"
      >
        <Database className="h-4 w-4 text-gray-400" />
        <span className="text-white font-medium text-sm">
          {selectedBucket ? selectedBucket.name : "Select Bucket"}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-black border border-white/10 rounded-lg shadow-xl py-2 z-50">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Your Buckets</p>
          </div>

          {buckets.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <Database className="h-8 w-8 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-3">No buckets configured</p>
              <Link
                href="/dashboard/buckets/add"
                className="inline-flex items-center text-white hover:text-gray-300 text-sm transition-colors duration-150"
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
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-white/5 transition-colors duration-150 ${
                    selectedBucket?.id === bucket.id ? "bg-white/5" : ""
                  }`}
                >
                  <span className="text-lg">{getProviderIcon(bucket.provider)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate text-sm">{bucket.name}</p>
                    <p className="text-gray-500 text-xs truncate">
                      {bucket.provider.toUpperCase()} • {bucket.memberCount} member{bucket.memberCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {selectedBucket?.id === bucket.id && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>
          )}

          <div className="border-t border-white/10 mt-2 pt-2">
            {/* Bucket-specific actions */}
            {selectedBucket && permissions?.canAdmin && (
              <>
                <Link
                  href={`/dashboard/buckets/${selectedBucket.id}/settings`}
                  className="flex items-center space-x-3 px-4 py-2.5 text-gray-500 hover:text-white hover:bg-white/5 transition-colors duration-150"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Bucket Settings</span>
                </Link>

                <Link
                  href={`/dashboard/buckets/${selectedBucket.id}/members`}
                  className="flex items-center space-x-3 px-4 py-2.5 text-gray-500 hover:text-white hover:bg-white/5 transition-colors duration-150"
                  onClick={() => setIsOpen(false)}
                >
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Manage Members</span>
                </Link>

                <div className="border-t border-white/10 my-2" />
              </>
            )}

            {/* Global actions */}
            <Link
              href="/dashboard/buckets/add"
              className="flex items-center space-x-3 px-4 py-2.5 text-white hover:text-gray-300 hover:bg-white/5 transition-colors duration-150"
              onClick={() => setIsOpen(false)}
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">Add New Bucket</span>
            </Link>

            <Link
              href="/dashboard/buckets"
              className="flex items-center space-x-3 px-4 py-2.5 text-gray-500 hover:text-white hover:bg-white/5 transition-colors duration-150"
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
