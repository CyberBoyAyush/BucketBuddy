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
      <div className="h-10 w-48 bg-gray-700 rounded-lg animate-pulse"></div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
      >
        <Database className="h-5 w-5 text-gray-400" />
        <span className="text-white font-medium">
          {selectedBucket ? selectedBucket.name : "Select Bucket"}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 z-50">
          <div className="px-3 py-2 border-b border-gray-700">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Your Buckets</p>
          </div>
          
          {buckets.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <Database className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No buckets configured</p>
              <Link
                href="/dashboard/buckets/add"
                className="inline-flex items-center mt-2 text-blue-400 hover:text-blue-300 text-sm"
                onClick={() => setIsOpen(false)}
              >
                <Plus className="h-4 w-4 mr-1" />
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
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-700 transition-colors ${
                    selectedBucket?.id === bucket.id ? "bg-gray-700" : ""
                  }`}
                >
                  <span className="text-lg">{getProviderIcon(bucket.provider)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{bucket.name}</p>
                    <p className="text-gray-400 text-xs truncate">
                      {bucket.provider.toUpperCase()} • {bucket.memberCount} member{bucket.memberCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {selectedBucket?.id === bucket.id && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>
          )}

          <div className="border-t border-gray-700 mt-2 pt-2">
            {/* Bucket-specific actions */}
            {selectedBucket && permissions?.canAdmin && (
              <>
                <Link
                  href={`/dashboard/buckets/${selectedBucket.id}/settings`}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Bucket Settings</span>
                </Link>

                <Link
                  href={`/dashboard/buckets/${selectedBucket.id}/members`}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Manage Members</span>
                </Link>

                <div className="border-t border-gray-700 my-2" />
              </>
            )}

            {/* Global actions */}
            <Link
              href="/dashboard/buckets/add"
              className="flex items-center space-x-2 px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">Add New Bucket</span>
            </Link>

            <Link
              href="/dashboard/buckets"
              className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
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
