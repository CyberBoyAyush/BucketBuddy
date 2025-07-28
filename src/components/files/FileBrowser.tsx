"use client";

import { useState, useEffect } from "react";
import {
  Folder,
  File,
  Upload,
  Search,
  Grid,
  List,
  X
} from "lucide-react";
import { formatFileSize, formatDate, getFileType } from "@/lib/utils";
import { FileUpload } from "./FileUpload";
import { FileOperations } from "./FileOperations";
import { SkeletonTable } from "@/components/ui/Skeleton";

interface S3Object {
  key: string;
  size: number;
  lastModified: Date;
  etag: string;
  isFolder: boolean;
}

interface FileBrowserProps {
  bucketId: string;
}

interface BucketPermissions {
  role: string;
  isOwner: boolean;
  canRead: boolean;
  canWrite: boolean;
  canAdmin: boolean;
}

export function FileBrowser({ bucketId }: FileBrowserProps) {
  const [objects, setObjects] = useState<S3Object[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "size" | "date">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterType, setFilterType] = useState<"all" | "image" | "video" | "audio" | "document" | "code" | "archive">("all");
  const [displayLimit, setDisplayLimit] = useState(50); // Limit initial display for performance
  const [permissions, setPermissions] = useState<BucketPermissions | null>(null);

  useEffect(() => {
    fetchObjects();
    fetchPermissions();
  }, [bucketId, currentPath]);

  const fetchObjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentPath) {
        params.append("prefix", currentPath);
      }

      const response = await fetch(`/api/buckets/${bucketId}/files?${params}`);
      if (response.ok) {
        const { objects } = await response.json();
        setObjects(objects);
      }
    } catch (error) {
      console.error("Error fetching objects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
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

  const navigateToFolder = (folderKey: string) => {
    setCurrentPath(folderKey);
    setSelectedObjects(new Set());
  };

  const navigateUp = () => {
    const pathParts = currentPath.split("/").filter(Boolean);
    pathParts.pop();
    const newPath = pathParts.length > 0 ? pathParts.join("/") + "/" : "";
    setCurrentPath(newPath);
    setSelectedObjects(new Set());
  };



  const filteredAndSortedObjects = objects
    .filter(obj => {
      const fileName = obj.key.split("/").pop() || "";

      // Search filter
      if (searchQuery && !fileName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Type filter
      if (filterType !== "all" && !obj.isFolder) {
        const fileType = getFileType(fileName);
        if (fileType !== filterType) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // Always put folders first
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;

      let comparison = 0;

      switch (sortBy) {
        case "name":
          const aName = a.key.split("/").pop() || "";
          const bName = b.key.split("/").pop() || "";
          comparison = aName.localeCompare(bName);
          break;
        case "size":
          comparison = a.size - b.size;
          break;
        case "date":
          comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const toggleSelection = (key: string) => {
    const newSelection = new Set(selectedObjects);
    if (newSelection.has(key)) {
      newSelection.delete(key);
    } else {
      newSelection.add(key);
    }
    setSelectedObjects(newSelection);
  };

  const getFileIcon = (fileName: string, isFolder: boolean) => {
    if (isFolder) {
      return <Folder className="h-5 w-5 text-blue-500" />;
    }
    
    const fileType = getFileType(fileName);
    const iconClass = "h-5 w-5";
    
    switch (fileType) {
      case "image":
        return <File className={`${iconClass} text-green-500`} />;
      case "video":
        return <File className={`${iconClass} text-purple-500`} />;
      case "audio":
        return <File className={`${iconClass} text-pink-500`} />;
      case "document":
        return <File className={`${iconClass} text-red-500`} />;
      case "code":
        return <File className={`${iconClass} text-yellow-500`} />;
      default:
        return <File className={`${iconClass} text-gray-500`} />;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-10 w-64 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-40 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        <SkeletonTable />
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Current folder indicator */}
          {currentPath && (
            <div className="text-sm text-gray-400">
              <span className="font-medium text-white">
                {currentPath.split("/").filter(Boolean).pop() || "Root"}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-2">
          {/* Search */}
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
            />
          </div>

          <div className="flex space-x-2">
            {/* File Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="flex-1 md:flex-none px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Files</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
              <option value="code">Code</option>
              <option value="archive">Archives</option>
            </select>

            {/* Sort Options */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split("-");
                setSortBy(sort as any);
                setSortOrder(order as any);
              }}
              className="flex-1 md:flex-none px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="size-asc">Size (Small to Large)</option>
              <option value="size-desc">Size (Large to Small)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="date-desc">Date (Newest First)</option>
            </select>

            {/* Clear Filters */}
            {(searchQuery || filterType !== "all" || sortBy !== "name" || sortOrder !== "asc") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                  setSortBy("name");
                  setSortOrder("asc");
                }}
                className="inline-flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                <X className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Clear</span>
              </button>
            )}
          </div>

          {/* View Mode Toggle - Hidden on mobile */}
          <div className="hidden md:flex items-center bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${
                viewMode === "list" ? "bg-gray-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${
                viewMode === "grid" ? "bg-gray-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>

          {/* Upload Button - Only show for users with write permissions */}
          {permissions?.canWrite && (
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </button>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <FileUpload
          bucketId={bucketId}
          currentPath={currentPath}
          onUploadComplete={() => {
            fetchObjects();
            setShowUpload(false);
          }}
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* File List */}
      {filteredAndSortedObjects.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {searchQuery ? "No files found" : "This folder is empty"}
          </h3>
          <p className="text-gray-400 mb-4">
            {searchQuery 
              ? `No files match "${searchQuery}"`
              : "Upload files to get started"
            }
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" : "space-y-1"}>
          {/* Back button for subfolders */}
          {currentPath && viewMode === "list" && (
            <button
              onClick={navigateUp}
              className="flex items-center space-x-3 p-3 hover:bg-gray-700 rounded-lg transition-colors w-full text-left"
            >
              <Folder className="h-5 w-5 text-blue-500" />
              <span className="text-white">.. (Back)</span>
            </button>
          )}
          
          {filteredAndSortedObjects.slice(0, displayLimit).map((object) => {
            const fileName = object.key.split("/").pop() || "";
            const isSelected = selectedObjects.has(object.key);
            
            if (viewMode === "grid") {
              return (
                <div
                  key={object.key}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors touch-manipulation ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-600 hover:border-gray-500 hover:bg-gray-700/50"
                  }`}
                  onClick={() => {
                    if (object.isFolder) {
                      navigateToFolder(object.key);
                    } else {
                      toggleSelection(object.key);
                    }
                  }}
                >
                  <div className="text-center">
                    <div className="mb-2 flex justify-center">
                      {getFileIcon(fileName, object.isFolder)}
                    </div>
                    <p className="text-white text-sm font-medium truncate" title={fileName}>
                      {fileName}
                    </p>
                    {!object.isFolder && (
                      <p className="text-gray-400 text-xs mt-1">
                        {formatFileSize(object.size)}
                      </p>
                    )}
                  </div>
                </div>
              );
            }
            
            return (
              <div
                key={object.key}
                className={`flex items-center justify-between p-4 md:p-3 hover:bg-gray-700 rounded-lg transition-colors touch-manipulation ${
                  isSelected ? "bg-blue-500/10" : ""
                }`}
              >
                <div 
                  className="flex items-center space-x-3 flex-1 cursor-pointer"
                  onClick={() => {
                    if (object.isFolder) {
                      navigateToFolder(object.key);
                    } else {
                      toggleSelection(object.key);
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(object.key)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {getFileIcon(fileName, object.isFolder)}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{fileName}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      {!object.isFolder && <span>{formatFileSize(object.size)}</span>}
                      <span>{formatDate(new Date(object.lastModified))}</span>
                    </div>
                  </div>
                </div>
                
                {!object.isFolder && (
                  <FileOperations
                    bucketId={bucketId}
                    fileKey={object.key}
                    fileName={fileName}
                    canWrite={permissions?.canWrite || false}
                    onDelete={() => {
                      setObjects(prev => prev.filter(obj => obj.key !== object.key));
                    }}
                    onRename={(newName) => {
                      setObjects(prev => prev.map(obj =>
                        obj.key === object.key
                          ? { ...obj, key: object.key.replace(fileName, newName) }
                          : obj
                      ));
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Load More Button */}
          {filteredAndSortedObjects.length > displayLimit && (
            <div className="text-center py-6">
              <button
                onClick={() => setDisplayLimit(prev => prev + 50)}
                className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Load More ({filteredAndSortedObjects.length - displayLimit} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
