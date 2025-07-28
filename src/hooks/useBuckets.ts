"use client";

import { useState, useEffect, useCallback } from "react";

interface Bucket {
  id: string;
  name: string;
  provider: string;
  bucketName: string;
  memberCount: number;
}

interface UseBucketsReturn {
  buckets: Bucket[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Simple in-memory cache
let bucketsCache: {
  data: Bucket[] | null;
  timestamp: number;
  expiry: number;
} = {
  data: null,
  timestamp: 0,
  expiry: 5 * 60 * 1000, // 5 minutes
};

export function useBuckets(): UseBucketsReturn {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBuckets = useCallback(async () => {
    try {
      setError(null);
      
      // Check cache first
      const now = Date.now();
      if (bucketsCache.data && (now - bucketsCache.timestamp) < bucketsCache.expiry) {
        setBuckets(bucketsCache.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await fetch("/api/buckets");
      
      if (!response.ok) {
        throw new Error("Failed to fetch buckets");
      }

      const { buckets: fetchedBuckets } = await response.json();
      
      // Update cache
      bucketsCache = {
        data: fetchedBuckets,
        timestamp: now,
        expiry: 5 * 60 * 1000,
      };
      
      setBuckets(fetchedBuckets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch buckets");
      console.error("Error fetching buckets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuckets();
  }, [fetchBuckets]);

  return {
    buckets,
    loading,
    error,
    refetch: fetchBuckets,
  };
}

// Utility function to invalidate cache
export function invalidateBucketsCache() {
  bucketsCache = {
    data: null,
    timestamp: 0,
    expiry: 5 * 60 * 1000,
  };
}
