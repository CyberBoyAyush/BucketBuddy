"use client";

import { useState, useEffect } from "react";
import {
  Folder,
  File,
  Upload,
  Search,
  Grid,
  List,
  X,
  ChevronUp,
  ChevronDown,
  Files,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  Archive,
  Code
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

// Helper function to get file type icon
const getFileTypeIcon = (fileName: string, isFolder: boolean = false) => {
  if (isFolder) {
    return <Folder className="h-5 w-5 text-blue-500" />;
  }

  const fileType = getFileType(fileName);
  const iconClass = "h-5 w-5";

  switch (fileType) {
    case "image":
      return <ImageIcon className={`${iconClass} text-green-500`} />;
    case "video":
      return <Video className={`${iconClass} text-red-500`} />;
    case "audio":
      return <Music className={`${iconClass} text-purple-500`} />;
    case "document":
      return <FileText className={`${iconClass} text-blue-500`} />;
    case "code":
      return <Code className={`${iconClass} text-yellow-500`} />;
    case "archive":
      return <Archive className={`${iconClass} text-orange-500`} />;
    default:
      return <File className={`${iconClass} text-gray-500`} />;
  }
};

// Helper function to check if file is an image
const isImageFile = (fileName: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

// Helper function to generate image preview URL
const getImagePreviewUrl = (bucketId: string, objectKey: string) => {
  return `/api/buckets/${bucketId}/files/preview?key=${encodeURIComponent(objectKey)}`;
};

interface BucketPermissions {
  role: string;
  isOwner: boolean;
  canRead: boolean;
  canWrite: boolean;
  canAdmin: boolean;
}

// Sortable header component
const SortableHeader = ({
  label,
  sortKey,
  currentSort,
  currentOrder,
  onSort
}: {
  label: string;
  sortKey: string;
  currentSort: string;
  currentOrder: string;
  onSort: (key: string) => void;
}) => {
  const isActive = currentSort === sortKey;

  return (
    <button
      onClick={() => onSort(sortKey)}
      className="flex items-center space-x-1 text-left hover:text-white transition-colors duration-150"
    >
      <span className="font-medium">{label}</span>
      {isActive && (
        currentOrder === "asc" ?
          <ChevronUp className="h-4 w-4" /> :
          <ChevronDown className="h-4 w-4" />
      )}
    </button>
  );
};

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

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key as "name" | "size" | "date");
      setSortOrder("asc");
    }
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



  if (loading) {
    return (
      <div className="hetzner-card rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="h-6 w-32 bg-white/5 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-10 w-64 bg-white/5 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-white/5 rounded animate-pulse"></div>
            <div className="h-10 w-40 bg-white/5 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-white/5 rounded animate-pulse"></div>
          </div>
        </div>
        <SkeletonTable />
      </div>
    );
  }

  return (
    <div className="hetzner-card rounded-lg px-4 py-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
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

        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
          {/* Search */}
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 hetzner-card hetzner-border rounded-lg hetzner-text placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors duration-150 w-full md:w-64"
            />
          </div>

          <div className="flex space-x-2">
            {/* File Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as "all" | "image" | "video" | "audio" | "document" | "code" | "archive")}
              className="flex-1 md:flex-none px-3 py-2 hetzner-card hetzner-border rounded-lg hetzner-text focus:outline-none focus:border-red-500 transition-colors duration-150"
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
                setSortBy(sort as "name" | "size" | "date");
                setSortOrder(order as "asc" | "desc");
              }}
              className="flex-1 md:flex-none px-3 py-2 hetzner-card hetzner-border rounded-lg hetzner-text focus:outline-none focus:border-red-500 transition-colors duration-150"
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
                className="inline-flex items-center px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-150"
              >
                <X className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">Clear</span>
              </button>
            )}
          </div>

          {/* View Mode Toggle - Hidden on mobile */}
          <div className="hidden md:flex items-center bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors duration-150 ${
                viewMode === "list" ? "bg-white/20 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors duration-150 ${
                viewMode === "grid" ? "bg-white/20 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>

          {/* Upload Button - Only show for users with write permissions */}
          {permissions?.canWrite && (
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center px-4 py-2 hetzner-btn-primary rounded-lg transition-colors duration-150"
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

      {/* Files Header */}
      <div className="flex items-center space-x-2 mb-2">
        <Files className="h-4 w-4 hetzner-red" />
        <h2 className="text-base font-semibold hetzner-text">Files</h2>
        <span className="text-xs hetzner-text-muted">
          ({filteredAndSortedObjects.length} items)
        </span>
      </div>

      {/* File List */}
      {filteredAndSortedObjects.length === 0 ? (
        <div className="text-center py-8">
          <Folder className="h-12 w-12 hetzner-text-muted mx-auto mb-3" />
          <h3 className="text-base font-medium hetzner-text mb-2">
            {searchQuery ? "No files found" : "This folder is empty"}
          </h3>
          <p className="hetzner-text-muted mb-4 text-sm">
            {searchQuery
              ? `No files match "${searchQuery}"`
              : "Upload files to get started"
            }
          </p>
          {!searchQuery && permissions?.canWrite && (
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center px-4 py-2 hetzner-btn-primary rounded-lg transition-colors duration-150"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </button>
          )}
        </div>
      ) : (
        <div>
          {/* List View Header */}
          {viewMode === "list" && (
            <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/10 text-sm text-gray-400">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedObjects.size === filteredAndSortedObjects.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedObjects(new Set(filteredAndSortedObjects.map(obj => obj.key)));
                    } else {
                      setSelectedObjects(new Set());
                    }
                  }}
                  className="rounded border-white/20 bg-black text-white focus:ring-white/20"
                />
              </div>
              <div className="col-span-5">
                <SortableHeader
                  label="Name"
                  sortKey="name"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                />
              </div>
              <div className="col-span-2">
                <SortableHeader
                  label="Type"
                  sortKey="type"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                />
              </div>
              <div className="col-span-2">
                <SortableHeader
                  label="Size"
                  sortKey="size"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                />
              </div>
              <div className="col-span-2">
                <SortableHeader
                  label="Modified"
                  sortKey="date"
                  currentSort={sortBy}
                  currentOrder={sortOrder}
                  onSort={handleSort}
                />
              </div>
            </div>
          )}

          {/* File Items */}
          <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-2" : "space-y-0"}>
            {/* Back button for subfolders */}
            {currentPath && viewMode === "list" && (
              <div className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors duration-150 cursor-pointer"
                   onClick={navigateUp}>
                <div className="col-span-1"></div>
                <div className="col-span-5 flex items-center space-x-3">
                  <Folder className="h-5 w-5 text-blue-500" />
                  <span className="text-white font-medium">.. (Back)</span>
                </div>
                <div className="col-span-6"></div>
              </div>
            )}

            {filteredAndSortedObjects.slice(0, displayLimit).map((object) => {
              const fileName = object.key.split("/").pop() || "";
              const isSelected = selectedObjects.has(object.key);
              const fileType = getFileType(fileName);
              const isImage = isImageFile(fileName);

              if (viewMode === "grid") {
                return (
                  <div
                    key={object.key}
                    className={`group relative p-6 border rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.03] hover:shadow-lg ${
                      isSelected
                        ? "border-red-500/40 bg-red-500/10 shadow-red-500/20"
                        : "hetzner-border hover:border-red-500/50 hetzner-hover"
                    }`}
                    onClick={() => {
                      if (object.isFolder) {
                        navigateToFolder(object.key);
                      } else {
                        toggleSelection(object.key);
                      }
                    }}
                  >
                    {/* Selection checkbox */}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelection(object.key);
                        }}
                        className="w-4 h-4 rounded border-white/30 bg-black/50 text-blue-500 focus:ring-blue-500/50 focus:ring-2"
                      />
                    </div>

                    {/* File operations */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <FileOperations
                        bucketId={bucketId}
                        fileKey={object.key}
                        fileName={fileName}
                        canWrite={permissions?.canWrite || false}
                        onDelete={() => {
                          setSelectedObjects(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(object.key);
                            return newSet;
                          });
                          fetchObjects();
                        }}
                        onRename={() => {
                          fetchObjects();
                        }}
                      />
                    </div>

                    <div className="text-center">
                      {/* Preview/Icon */}
                      <div className="mb-4 flex justify-center">
                        {isImage && !object.isFolder ? (
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center shadow-inner">
                            <img
                              src={getImagePreviewUrl(bucketId, object.key)}
                              alt={fileName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to icon if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '';
                                  const iconDiv = document.createElement('div');
                                  iconDiv.className = 'flex items-center justify-center w-full h-full';
                                  parent.appendChild(iconDiv);
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center shadow-inner">
                            <div className="scale-125">
                              {getFileTypeIcon(fileName, object.isFolder)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* File info */}
                      <div className="space-y-2">
                        <p className="text-white text-sm font-medium truncate leading-tight" title={fileName}>
                          {fileName}
                        </p>
                        {!object.isFolder && (
                          <div className="text-xs text-gray-400 space-y-1">
                            <p className="font-medium">{formatFileSize(object.size)}</p>
                            <p className="capitalize text-gray-500">{fileType}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
            }

            // List view
            return (
              <div
                key={object.key}
                className={`grid grid-cols-12 gap-4 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors duration-150 cursor-pointer ${
                  isSelected ? "bg-blue-500/10" : ""
                }`}
                onClick={() => {
                  if (object.isFolder) {
                    navigateToFolder(object.key);
                  } else {
                    toggleSelection(object.key);
                  }
                }}
              >
                {/* Checkbox */}
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelection(object.key);
                    }}
                    className="rounded border-white/20 bg-black text-white focus:ring-white/20"
                  />
                </div>

                {/* Name with icon */}
                <div className="col-span-5 flex items-center space-x-3 min-w-0">
                  {getFileTypeIcon(fileName, object.isFolder)}
                  <span className="text-white font-medium truncate" title={fileName}>
                    {fileName}
                  </span>
                </div>

                {/* Type */}
                <div className="col-span-2 flex items-center">
                  <span className="text-gray-400 text-sm capitalize">
                    {object.isFolder ? "Folder" : fileType}
                  </span>
                </div>

                {/* Size */}
                <div className="col-span-2 flex items-center">
                  <span className="text-gray-400 text-sm">
                    {object.isFolder ? "—" : formatFileSize(object.size)}
                  </span>
                </div>

                {/* Modified */}
                <div className="col-span-2 flex items-center justify-between">
                  <span className="text-gray-400 text-sm">
                    {formatDate(new Date(object.lastModified))}
                  </span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <FileOperations
                      bucketId={bucketId}
                      fileKey={object.key}
                      fileName={fileName}
                      canWrite={permissions?.canWrite || false}
                      onDelete={() => {
                        setSelectedObjects(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(object.key);
                          return newSet;
                        });
                        fetchObjects();
                      }}
                      onRename={() => {
                        fetchObjects();
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Load More Button */}
          {filteredAndSortedObjects.length > displayLimit && (
            <div className="text-center py-4 mt-4">
              <button
                onClick={() => setDisplayLimit(prev => prev + 50)}
                className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-150"
              >
                Load More ({filteredAndSortedObjects.length - displayLimit} remaining)
              </button>
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
}
