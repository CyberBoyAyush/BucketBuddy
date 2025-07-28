"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { BucketForm } from "@/components/buckets/BucketForm";
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

interface Bucket {
  id: string;
  name: string;
  provider: string;
  region: string;
  endpoint?: string;
  bucketName: string;
  accessKey: string;
  secretKey: string;
}

export default function BucketSettingsPage({ params }: { params: Promise<{ bucketId: string }> }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [bucket, setBucket] = useState<Bucket | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);

  // Unwrap the params Promise
  const { bucketId } = use(params);

  useEffect(() => {
    fetchBucket();
  }, [bucketId]);

  const fetchBucket = async () => {
    try {
      // Use the edit endpoint to get decrypted credentials
      const response = await fetch(`/api/buckets/${bucketId}/edit`);
      if (response.ok) {
        const { bucket } = await response.json();
        setBucket(bucket);
        setHasAccess(true);
      } else if (response.status === 404) {
        setHasAccess(false);
      } else {
        addToast({
          type: "error",
          title: "Error",
          message: "Failed to load bucket details",
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to load bucket details",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (bucketData: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/buckets/${bucketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bucketData),
      });

      if (response.ok) {
        addToast({
          type: "success",
          title: "Success",
          message: "Bucket settings updated successfully",
        });
        fetchBucket(); // Refresh bucket data
      } else {
        const { error } = await response.json();
        throw new Error(error || "Failed to update bucket");
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Update failed",
        message: error instanceof Error ? error.message : "Failed to update bucket",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/buckets/${bucketId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        addToast({
          type: "success",
          title: "Success",
          message: "Bucket deleted successfully",
        });
        router.push("/dashboard/buckets");
      } else {
        const { error } = await response.json();
        addToast({
          type: "error",
          title: "Delete failed",
          message: error || "Failed to delete bucket",
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Delete failed",
        message: "Failed to delete bucket",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-white/5 rounded w-1/3 mb-4"></div>
            <div className="h-96 bg-white/5 rounded"></div>
          </div>
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

  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Access Denied</h3>
          <p className="text-gray-400 mb-4">Only bucket owners can access settings</p>
          <Link href="/dashboard/buckets" className="text-blue-400 hover:text-blue-300">
            Back to buckets
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link
            href={`/dashboard/buckets/${bucketId}`}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-150"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Bucket Settings</h1>
            <p className="text-gray-400">
              Configure settings for "{bucket.name}"
            </p>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-black border border-white/10 rounded-xl p-6">
          <BucketForm
            onSubmit={handleUpdate}
            isSubmitting={isSubmitting}
            initialData={bucket}
          />
        </div>

        {/* Danger Zone */}
        <div className="bg-black border border-red-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
          <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Delete Bucket</h4>
              <p className="text-gray-400 text-sm">
                Permanently delete this bucket configuration. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-150"
            >
              <Trash2 className="h-4 w-4 mr-2 inline" />
              Delete
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <h3 className="text-lg font-semibold text-white">Confirm Deletion</h3>
              </div>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete "{bucket.name}"? This will remove the bucket configuration 
                and all associated permissions. This action cannot be undone.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete Bucket
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
