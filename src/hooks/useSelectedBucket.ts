import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Bucket {
  id: string;
  name: string;
  provider: string;
  bucketName: string;
  memberCount: number;
}

interface SelectedBucketStore {
  selectedBucket: Bucket | null;
  setSelectedBucket: (bucket: Bucket | null) => void;
}

export const useSelectedBucket = create<SelectedBucketStore>()(
  persist(
    (set) => ({
      selectedBucket: null,
      setSelectedBucket: (bucket) => set({ selectedBucket: bucket }),
    }),
    {
      name: 'selected-bucket-storage',
    }
  )
);
