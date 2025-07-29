"use client";

import { useState } from "react";
import { X, Folder, Plus } from "lucide-react";

interface NewFolderProps {
  bucketId: string;
  currentPath: string;
  onFolderCreated: () => void;
  onClose: () => void;
}

export function NewFolder({ bucketId, currentPath, onFolderCreated, onClose }: NewFolderProps) {
  const [folderName, setFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      setError("Folder name is required");
      return;
    }

    // Validate folder name
    const sanitizedName = folderName.trim();
    if (!/^[a-zA-Z0-9\-_\s]+$/.test(sanitizedName)) {
      setError("Folder name can only contain letters, numbers, spaces, hyphens, and underscores");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const response = await fetch(`/api/buckets/${bucketId}/files/create-folder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderName: sanitizedName,
          path: currentPath,
        }),
      });

      if (response.ok) {
        onFolderCreated();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      setError("Failed to create folder");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="hetzner-card border hetzner-border rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b hetzner-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Folder className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold hetzner-text">Create New Folder</h2>
              <p className="text-sm hetzner-text-muted">
                {currentPath ? `in ${currentPath}` : "in root directory"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hetzner-hover rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 hetzner-text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="folderName" className="block text-sm font-medium hetzner-text mb-2">
                Folder Name
              </label>
              <input
                id="folderName"
                type="text"
                value={folderName}
                onChange={(e) => {
                  setFolderName(e.target.value);
                  setError("");
                }}
                placeholder="Enter folder name..."
                className="w-full px-4 py-3 hetzner-card border hetzner-border rounded-lg hetzner-text placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                disabled={isCreating}
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm hetzner-red">{error}</p>
              )}
            </div>

            <div className="hetzner-hover rounded-lg p-4">
              <h4 className="text-sm font-medium hetzner-text mb-2">Naming Guidelines:</h4>
              <ul className="text-xs hetzner-text-muted space-y-1">
                <li>• Use letters, numbers, spaces, hyphens, and underscores only</li>
                <li>• Avoid special characters like / \ : * ? " &lt; &gt; |</li>
                <li>• Keep names descriptive and organized</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 hetzner-text-muted hover:hetzner-text transition-colors duration-200"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !folderName.trim()}
              className="inline-flex items-center px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 hetzner-text rounded-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-blue-500/25"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Folder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
