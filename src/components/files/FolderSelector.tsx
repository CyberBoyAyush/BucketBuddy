"use client";

import { useState, useEffect } from "react";
import { Folder, Home, ChevronRight, X, Move } from "lucide-react";

interface S3Object {
  key: string;
  size: number;
  lastModified: Date;
  etag: string;
  isFolder: boolean;
}

interface FolderSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (folderPath: string) => void;
  bucketId: string;
  currentPath: string;
  title: string;
  itemCount?: number;
  isLoading?: boolean;
}

export function FolderSelector({
  isOpen,
  onClose,
  onSelect,
  bucketId,
  currentPath,
  title,
  itemCount,
  isLoading = false
}: FolderSelectorProps) {
  const [folders, setFolders] = useState<S3Object[]>([]);
  const [selectedPath, setSelectedPath] = useState("");
  const [browsePath, setBrowsePath] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFolders("");
    }
  }, [isOpen, bucketId]);

  const fetchFolders = async (path: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (path) {
        params.append("prefix", path);
      }

      const response = await fetch(`/api/buckets/${bucketId}/files?${params}`);
      if (response.ok) {
        const { objects } = await response.json();
        // Only show folders
        const folderObjects = objects.filter((obj: S3Object) => obj.isFolder);
        setFolders(folderObjects);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folderPath: string) => {
    setBrowsePath(folderPath);
    fetchFolders(folderPath);
  };

  const navigateUp = () => {
    const pathParts = browsePath.split("/").filter(Boolean);
    pathParts.pop();
    const newPath = pathParts.length > 0 ? pathParts.join("/") + "/" : "";
    setBrowsePath(newPath);
    fetchFolders(newPath);
  };

  const getDisplayName = (key: string) => {
    const cleanKey = key.endsWith('/') ? key.slice(0, -1) : key;
    return cleanKey.split('/').pop() || '';
  };

  const getBreadcrumbs = () => {
    if (!browsePath) return [];
    return browsePath.split("/").filter(Boolean);
  };

  const handleSelect = () => {
    onSelect(selectedPath || browsePath);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="hetzner-card border hetzner-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b hetzner-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Move className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold hetzner-text">{title}</h2>
              {itemCount && (
                <p className="text-sm hetzner-text-muted">
                  {itemCount} item{itemCount !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hetzner-hover rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <X className="h-5 w-5 hetzner-text-muted" />
          </button>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="px-6 py-4 border-b hetzner-border">
          <nav className="flex items-center space-x-1 text-sm">
            <button
              onClick={() => navigateToFolder("")}
              className="flex items-center space-x-1 px-2 py-1 rounded-md hetzner-hover transition-colors duration-150 hetzner-text-muted hover:hetzner-text"
            >
              <Home className="h-4 w-4" />
              <span>Root</span>
            </button>

            {getBreadcrumbs().map((part, index) => {
              const path = getBreadcrumbs().slice(0, index + 1).join("/") + "/";
              const isLast = index === getBreadcrumbs().length - 1;

              return (
                <div key={path} className="flex items-center space-x-1">
                  <ChevronRight className="h-4 w-4 hetzner-text-subtle" />
                  <button
                    onClick={() => navigateToFolder(path)}
                    className={`px-2 py-1 rounded-md transition-colors duration-150 ${
                      isLast
                        ? "hetzner-text font-medium hetzner-hover"
                        : "hetzner-text-muted hover:hetzner-text hetzner-hover"
                    }`}
                  >
                    {part}
                  </button>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Folder List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Back button */}
              {browsePath && (
                <button
                  onClick={navigateUp}
                  className="w-full flex items-center space-x-3 px-4 py-3 hetzner-hover rounded-lg transition-colors duration-200 text-left"
                >
                  <Folder className="h-5 w-5 text-blue-400" />
                  <span className="hetzner-text font-medium">.. (Back)</span>
                </button>
              )}

              {/* Current folder option */}
              <button
                onClick={() => setSelectedPath(browsePath)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 text-left ${
                  selectedPath === browsePath
                    ? "bg-purple-500/20 border border-purple-500/30"
                    : "hetzner-hover border border-transparent"
                }`}
              >
                <Home className="h-5 w-5 text-purple-400" />
                <span className="hetzner-text font-medium">
                  Current folder {browsePath ? `(${browsePath})` : "(Root)"}
                </span>
              </button>

              {/* Folder list */}
              {folders.map((folder) => {
                const displayName = getDisplayName(folder.key);
                const isSelected = selectedPath === folder.key;

                return (
                  <div key={folder.key} className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedPath(folder.key)}
                      className={`flex-1 flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 text-left ${
                        isSelected
                          ? "bg-purple-500/20 border border-purple-500/30"
                          : "hetzner-hover border border-transparent"
                      }`}
                    >
                      <Folder className="h-5 w-5 text-blue-400" />
                      <span className="hetzner-text font-medium">{displayName}</span>
                    </button>
                    <button
                      onClick={() => navigateToFolder(folder.key)}
                      className="p-2 hetzner-text-muted hover:hetzner-text hetzner-hover rounded-lg transition-colors duration-200"
                      title="Browse folder"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}

              {folders.length === 0 && !browsePath && (
                <div className="text-center py-8">
                  <Folder className="h-12 w-12 hetzner-text-muted mx-auto mb-3" />
                  <p className="hetzner-text-muted">No folders found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t hetzner-border">
          <p className="text-sm hetzner-text-muted">
            {selectedPath ? `Moving to: ${selectedPath || "Root"}` : "Select a destination folder"}
          </p>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 hetzner-text-muted hover:hetzner-text transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={isLoading}
              className="inline-flex items-center px-6 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 hetzner-text rounded-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-purple-500/25"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                  Moving...
                </>
              ) : (
                <>
                  <Move className="h-4 w-4 mr-2" />
                  Move Here
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
