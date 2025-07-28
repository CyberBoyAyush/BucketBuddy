"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { BucketForm } from "@/components/buckets/BucketForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddBucketPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (bucketData: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/buckets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bucketData),
      });

      if (response.ok) {
        const { bucket } = await response.json();
        router.push(`/dashboard/buckets/${bucket.id}`);
      } else {
        const { error } = await response.json();
        throw new Error(error || "Failed to create bucket");
      }
    } catch (error) {
      console.error("Error creating bucket:", error);
      throw error; // Let the form handle the error display
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/buckets"
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Add New Bucket</h1>
            <p className="text-gray-400">
              Connect your S3 or R2 storage bucket to start managing files
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <BucketForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </DashboardLayout>
  );
}
