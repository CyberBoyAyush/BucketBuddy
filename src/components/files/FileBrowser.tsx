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
  Code,
  Home,
  ChevronRight,
  Eye,
  FolderPlus,
  RefreshCw
} from "lucide-react";
import { formatFileSize, formatDate, getFileType } from "@/lib/utils";
import { FileUpload } from "./FileUpload";
import { FileOperations } from "./FileOperations";
import { NewFolder } from "./NewFolder";
import { BulkOperations } from "./BulkOperations";
import { PasswordPrompt } from "../buckets/PasswordPrompt";
import { FilePreview } from "./FilePreview";
import { getBucketPassword, storeBucketPassword, initializePasswordManager } from "@/lib/password-manager";

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

// Helper function to get file type icon with enhanced styling
const getFileTypeIcon = (fileName: string, isFolder: boolean = false, size: "sm" | "md" | "lg" = "md") => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  const iconClass = sizeClasses[size];

  if (isFolder) {
    return <Folder className={`${iconClass} text-blue-400 drop-shadow-sm`} />;
  }

  const fileType = getFileType(fileName);

  switch (fileType) {
    case "image":
      return <ImageIcon className={`${iconClass} text-emerald-400 drop-shadow-sm`} />;
    case "video":
      return <Video className={`${iconClass} text-rose-400 drop-shadow-sm`} />;
    case "audio":
      return <Music className={`${iconClass} text-violet-400 drop-shadow-sm`} />;
    case "document":
      return <FileText className={`${iconClass} text-sky-400 drop-shadow-sm`} />;
    case "code":
      return <Code className={`${iconClass} text-amber-400 drop-shadow-sm`} />;
    case "archive":
      return <Archive className={`${iconClass} text-orange-400 drop-shadow-sm`} />;
    default:
      return <File className={`${iconClass} text-gray-400 drop-shadow-sm`} />;
  }
};

// Helper function to check if file is an image
const isImageFile = (fileName: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

// Helper function to check if file is previewable
const isPreviewableFile = (fileName: string) => {
  const previewableExtensions = [
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp',
    // Documents
    '.pdf',
    // Videos
    '.mp4', '.webm', '.ogg', '.mov', '.avi',
    // Audio
    '.mp3', '.wav', '.ogg', '.m4a', '.flac',
    // Text
    '.txt', '.md', '.json', '.xml', '.csv', '.log'
  ];
  return previewableExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

// Helper function to generate image preview URL
const getImagePreviewUrl = (bucketId: string, objectKey: string, password?: string) => {
  const params = new URLSearchParams();
  params.append('key', objectKey);
  if (password) {
    params.append('password', password);
  }
  return `/api/buckets/${bucketId}/files/preview?${params}`;
};

// Helper function to extract display name from object key
const getDisplayName = (key: string, isFolder: boolean = false) => {
  if (isFolder) {
    // For folders, remove trailing slash and get the last part
    const cleanKey = key.endsWith('/') ? key.slice(0, -1) : key;
    return cleanKey.split('/').pop() || '';
  } else {
    // For files, just get the last part
    return key.split('/').pop() || '';
  }
};

interface BucketPermissions {
  role: string;
  isOwner: boolean;
  canRead: boolean;
  canWrite: boolean;
  canAdmin: boolean;
}

// Breadcrumb navigation component
const BreadcrumbNavigation = ({
  currentPath,
  onNavigate
}: {
  currentPath: string;
  onNavigate: (path: string) => void;
}) => {
  const pathParts = currentPath.split("/").filter(Boolean);

  return (
    <nav className="flex items-center space-x-1 text-sm">
      <button
        onClick={() => onNavigate("")}
        className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-white/10 transition-colors duration-150 text-gray-400 hover:text-white"
      >
        <Home className="h-4 w-4" />
        <span>Root</span>
      </button>

      {pathParts.map((part, index) => {
        const path = pathParts.slice(0, index + 1).join("/") + "/";
        const isLast = index === pathParts.length - 1;

        return (
          <div key={path} className="flex items-center space-x-1">
            <ChevronRight className="h-4 w-4 text-gray-600" />
            <button
              onClick={() => onNavigate(path)}
              className={`px-2 py-1 rounded-md transition-colors duration-150 ${
                isLast
                  ? "text-white font-medium bg-white/10"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {part}
            </button>
          </div>
        );
      })}
    </nav>
  );
};

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
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "size" | "date">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterType, setFilterType] = useState<"all" | "image" | "video" | "audio" | "document" | "code" | "archive">("all");
  const [displayLimit, setDisplayLimit] = useState(50); // Limit initial display for performance
  const [permissions, setPermissions] = useState<BucketPermissions | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [bucketName, setBucketName] = useState("");
  const [previewFile, setPreviewFile] = useState<S3Object | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    initializePasswordManager();
    fetchBucketInfo();
    fetchObjects();
    fetchPermissions();
  }, [bucketId, currentPath]);

  const fetchBucketInfo = async () => {
    try {
      const response = await fetch(`/api/buckets/${bucketId}`);
      if (response.ok) {
        const { bucket } = await response.json();
        setBucketName(bucket.name);
      }
    } catch (error) {
      console.error("Error fetching bucket info:", error);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    setIsVerifyingPassword(true);
    setPasswordError("");

    try {
      const response = await fetch(`/api/buckets/${bucketId}/verify-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Store password locally and close prompt
        storeBucketPassword(bucketId, password);
        setShowPasswordPrompt(false);
        // Retry fetching objects
        fetchObjects();
      } else {
        const { error } = await response.json();
        setPasswordError(error || "Invalid password");
      }
    } catch (error) {
      console.error('Password verification error:', error);
      setPasswordError("Failed to verify password. Please try again.");
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const fetchObjects = async () => {
    setLoading(true);
    try {
      // Check if we have a stored password for this bucket
      const storedPassword = getBucketPassword(bucketId);

      const params = new URLSearchParams();
      if (currentPath) {
        params.append("prefix", currentPath);
      }
      if (storedPassword) {
        params.append("password", storedPassword);
      }

      const response = await fetch(`/api/buckets/${bucketId}/files?${params}`);

      if (response.status === 401 && !storedPassword) {
        // Need password to access encrypted bucket
        setShowPasswordPrompt(true);
        setLoading(false);
        return;
      }

      if (response.status === 401 && storedPassword) {
        // Stored password is invalid, prompt for new one
        setPasswordError("Stored password is invalid. Please enter the correct password.");
        setShowPasswordPrompt(true);
        setLoading(false);
        return;
      }

      if (response.ok) {
        const { objects } = await response.json();
        setObjects(objects);
      } else {
        console.error("Error fetching objects:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching objects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      console.log('Fetching permissions for bucket:', bucketId);
      const response = await fetch(`/api/buckets/${bucketId}/permissions`);
      console.log('Permissions response status:', response.status);

      if (response.ok) {
        const { permissions } = await response.json();
        console.log('Permissions fetched:', permissions);
        setPermissions(permissions);
      } else {
        console.error('Failed to fetch permissions:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
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
      const displayName = getDisplayName(obj.key, obj.isFolder);

      // Search filter
      if (searchQuery && !displayName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Type filter
      if (filterType !== "all" && !obj.isFolder) {
        const fileType = getFileType(displayName);
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
          const aName = getDisplayName(a.key, a.isFolder);
          const bName = getDisplayName(b.key, b.isFolder);
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

  const handleFileDoubleClick = (object: S3Object) => {
    if (object.isFolder) {
      navigateToFolder(object.key);
    } else if (isPreviewableFile(object.key)) {
      setPreviewFile(object);
      setShowPreview(true);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewFile(null);
  };



  if (loading) {
    return (
      <div className="hetzner-card rounded-xl p-6 shadow-lg">
        {/* Enhanced loading header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse"></div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-3">
            <div className="h-10 w-full md:w-64 bg-gradient-to-r from-white/10 to-white/5 rounded-lg animate-pulse"></div>
            <div className="flex space-x-2">
              <div className="h-10 w-32 bg-gradient-to-r from-white/10 to-white/5 rounded-lg animate-pulse"></div>
              <div className="h-10 w-40 bg-gradient-to-r from-white/10 to-white/5 rounded-lg animate-pulse"></div>
              <div className="h-10 w-24 bg-gradient-to-r from-white/10 to-white/5 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Enhanced loading grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="group relative p-6 border border-white/10 rounded-xl bg-gradient-to-br from-white/5 to-transparent">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-white/10 to-white/5 rounded-xl animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse"></div>
                  <div className="h-3 w-2/3 mx-auto bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hetzner-card rounded-xl shadow-lg border border-white/10">
      {/* Enhanced Toolbar */}
      <div className="bg-gradient-to-r from-white/5 to-transparent border-b border-white/10 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-4 min-w-0">
            <BreadcrumbNavigation
              currentPath={currentPath}
              onNavigate={setCurrentPath}
            />
          </div>

          {/* Modern Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Modern Search Bar */}
            <div className="relative group flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-red-400 transition-colors duration-200" />
              </div>
              <input
                type="text"
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200 hover:bg-gray-900/80"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-white transition-colors duration-200" />
                </button>
              )}
            </div>

            {/* Modern Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* File Type Filter */}
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as "all" | "image" | "video" | "audio" | "document" | "code" | "archive")}
                  className="appearance-none bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl px-4 py-3 pr-10 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200 hover:bg-gray-900/80 cursor-pointer min-w-[130px]"
                >
                  <option value="all">All Files</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                  <option value="audio">Audio</option>
                  <option value="document">Documents</option>
                  <option value="code">Code</option>
                  <option value="archive">Archives</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort Options */}
              <div className="relative">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split("-");
                    setSortBy(sort as "name" | "size" | "date");
                    setSortOrder(order as "asc" | "desc");
                  }}
                  className="appearance-none bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl px-4 py-3 pr-10 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200 hover:bg-gray-900/80 cursor-pointer min-w-[140px]"
                >
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="size-asc">Size ↑</option>
                  <option value="size-desc">Size ↓</option>
                  <option value="date-asc">Date ↑</option>
                  <option value="date-desc">Date ↓</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* View Mode Toggle */}
              <div className="hidden md:flex items-center bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-lg transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-lg transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                  title="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {/* Refresh Button */}
                <button
                  onClick={fetchObjects}
                  disabled={loading}
                  className="p-2.5 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-800/80 disabled:bg-gray-900/30 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 hover:scale-105"
                  title="Refresh bucket contents"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>

                {/* Write-only buttons */}
                {permissions?.canWrite && (
                  <>
                    <button
                      onClick={() => setShowNewFolder(true)}
                      className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-blue-600/25"
                    >
                      <FolderPlus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">New Folder</span>
                    </button>
                    <button
                      onClick={() => setShowUpload(true)}
                      className="inline-flex items-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-red-600/25"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Upload</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
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

      {/* New Folder Modal */}
      {showNewFolder && (
        <NewFolder
          bucketId={bucketId}
          currentPath={currentPath}
          onFolderCreated={() => {
            fetchObjects();
            setShowNewFolder(false);
          }}
          onClose={() => setShowNewFolder(false)}
        />
      )}

      {/* Enhanced Content Area */}
      <div className="p-6">
        {/* Files Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Files className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Files & Folders</h2>
              <p className="text-sm text-gray-400">
                {filteredAndSortedObjects.length} {filteredAndSortedObjects.length === 1 ? 'item' : 'items'}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>
          </div>

          {/* Mobile view toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2.5 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-800/80 rounded-xl transition-all duration-200"
              title={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
            >
              {viewMode === "grid" ? <List className="h-5 w-5 text-white" /> : <Grid className="h-5 w-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Enhanced Empty State */}
        {filteredAndSortedObjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center">
                <Folder className="h-12 w-12 text-gray-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                <Search className="h-4 w-4 text-red-400" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-white mb-3">
              {searchQuery ? "No files found" : "This folder is empty"}
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {searchQuery
                ? `No files match "${searchQuery}". Try adjusting your search terms or filters.`
                : "Get started by uploading your first files to this folder."
              }
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {!searchQuery && permissions?.canWrite && (
                <>
                  <button
                    onClick={() => setShowNewFolder(true)}
                    className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 hetzner-text rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                  >
                    <FolderPlus className="h-5 w-5 mr-2" />
                    Create Folder
                  </button>
                  <button
                    onClick={() => setShowUpload(true)}
                    className="inline-flex items-center px-6 py-3 hetzner-red-bg hover:hetzner-red-bg:hover hetzner-text rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-red-500/25"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Files
                  </button>
                </>
              )}

              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterType("all");
                  }}
                  className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
                >
                  <X className="h-5 w-5 mr-2" />
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Enhanced List View Header */}
            {viewMode === "list" && (
              <div className="bg-white/5 rounded-lg mb-4">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-medium text-gray-300">
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
                      className="w-4 h-4 rounded border-white/30 bg-black/50 text-red-500 focus:ring-red-500/50 focus:ring-2"
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
              </div>
            )}

            {/* Enhanced File Items Container */}
            <div className={
              viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                : "space-y-1"
            }>
              {/* Back button for subfolders */}
              {currentPath && viewMode === "list" && (
                <div
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-white/5 rounded-lg transition-all duration-200 cursor-pointer group"
                  onClick={navigateUp}
                >
                  <div className="col-span-1"></div>
                  <div className="col-span-5 flex items-center space-x-3">
                    <Folder className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors duration-200" />
                    <span className="text-white font-medium group-hover:text-blue-300 transition-colors duration-200">.. (Back)</span>
                  </div>
                  <div className="col-span-6"></div>
                </div>
              )}

              {filteredAndSortedObjects.slice(0, displayLimit).map((object) => {
                const displayName = getDisplayName(object.key, object.isFolder);
                const isSelected = selectedObjects.has(object.key);
                const fileType = getFileType(displayName);
                const isImage = isImageFile(displayName);

                if (viewMode === "grid") {
                  return (
                    <div
                      key={object.key}
                      className={`group relative p-5 border rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                        isSelected
                          ? "border-red-500/50 bg-gradient-to-br from-red-500/10 to-red-500/5 shadow-lg shadow-red-500/20"
                          : "border-white/10 bg-gradient-to-br from-white/5 to-transparent hover:border-red-500/30 hover:shadow-lg hover:shadow-black/20"
                      }`}
                      onClick={() => {
                        if (!object.isFolder) {
                          toggleSelection(object.key);
                        }
                      }}
                      onDoubleClick={() => handleFileDoubleClick(object)}
                    >
                      {/* Selection checkbox */}
                      <div className={`absolute top-3 left-3 transition-all duration-200 ${
                        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSelection(object.key);
                          }}
                          className="w-4 h-4 rounded border-white/30 bg-black/50 text-red-500 focus:ring-red-500/50 focus:ring-2"
                        />
                      </div>

                      {/* Preview indicator for previewable files */}
                      {!object.isFolder && isPreviewableFile(object.key) && (
                        <div className="absolute top-3 right-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="p-1 bg-blue-500/20 rounded-md" title="Double-click to preview">
                            <Eye className="h-3 w-3 text-blue-400" />
                          </div>
                        </div>
                      )}

                      {/* File operations */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <FileOperations
                          bucketId={bucketId}
                          fileKey={object.key}
                          fileName={displayName}
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
                          onMove={() => {
                            fetchObjects();
                          }}
                          currentPath={currentPath}
                          isFolder={object.isFolder}
                        />
                      </div>

                      <div className="text-center">
                        {/* Enhanced Preview/Icon */}
                        <div className="mb-5 flex justify-center">
                          {isImage && !object.isFolder ? (
                            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 shadow-inner group-hover:shadow-lg transition-shadow duration-300">
                              <img
                                src={getImagePreviewUrl(bucketId, object.key, getBucketPassword(bucketId) || undefined)}
                                alt={displayName}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => {
                                  // Hide the image and show the parent as a regular icon container
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.className = "w-24 h-24 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center shadow-inner group-hover:shadow-lg transition-all duration-300 group-hover:scale-105";
                                    const iconContainer = document.createElement('div');
                                    iconContainer.className = "scale-150 transition-transform duration-300 group-hover:scale-[1.7]";
                                    parent.appendChild(iconContainer);
                                  }
                                }}
                              />
                              {/* Image overlay */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center shadow-inner group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                              <div className="scale-150 transition-transform duration-300 group-hover:scale-[1.7]">
                                {getFileTypeIcon(displayName, object.isFolder, "lg")}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Enhanced File info */}
                        <div className="space-y-3">
                          <p className="text-white text-sm font-semibold truncate leading-tight px-2" title={displayName}>
                            {displayName}
                          </p>
                          {!object.isFolder && (
                            <div className="text-xs space-y-1">
                              <div className="flex items-center justify-center space-x-2 text-gray-400">
                                <span className="font-medium">{formatFileSize(object.size)}</span>
                                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                <span className="capitalize">{fileType}</span>
                              </div>
                              <p className="text-gray-500 text-xs">
                                {formatDate(new Date(object.lastModified))}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                  </div>
                    );
                }

                // Enhanced List view
                return (
                  <div
                    key={object.key}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 rounded-lg transition-all duration-200 cursor-pointer group ${
                      isSelected
                        ? "bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20"
                        : "hover:bg-white/5 border border-transparent hover:border-white/10"
                    }`}
                    onClick={() => {
                      if (!object.isFolder) {
                        toggleSelection(object.key);
                      }
                    }}
                    onDoubleClick={() => handleFileDoubleClick(object)}
                  >
                    {/* Enhanced Checkbox */}
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelection(object.key);
                        }}
                        className="w-4 h-4 rounded border-white/30 bg-black/50 text-red-500 focus:ring-red-500/50 focus:ring-2"
                      />
                    </div>

                    {/* Enhanced Name with icon */}
                    <div className="col-span-5 flex items-center space-x-3 min-w-0">
                      <div className="flex-shrink-0">
                        {getFileTypeIcon(displayName, object.isFolder)}
                      </div>
                      <span
                        className="text-white font-medium truncate group-hover:text-red-300 transition-colors duration-200"
                        title={object.isFolder ? `Double-click to open ${displayName}` : isPreviewableFile(object.key) ? `Double-click to preview ${displayName}` : displayName}
                      >
                        {displayName}
                      </span>
                      {!object.isFolder && isPreviewableFile(object.key) && (
                        <div title="Previewable file">
                          <Eye className="h-3 w-3 text-blue-400 opacity-60" />
                        </div>
                      )}
                    </div>

                    {/* Enhanced Type */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-gray-400 text-sm capitalize font-medium">
                        {object.isFolder ? "Folder" : fileType}
                      </span>
                    </div>

                    {/* Enhanced Size */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-gray-400 text-sm font-medium">
                        {object.isFolder ? "—" : formatFileSize(object.size)}
                      </span>
                    </div>

                    {/* Enhanced Modified */}
                    <div className="col-span-2 flex items-center justify-between">
                      <span className="text-gray-400 text-sm">
                        {formatDate(new Date(object.lastModified))}
                      </span>
                      <div onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <FileOperations
                          bucketId={bucketId}
                          fileKey={object.key}
                          fileName={displayName}
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
                          onMove={() => {
                            fetchObjects();
                          }}
                          currentPath={currentPath}
                          isFolder={object.isFolder}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Enhanced Load More Button */}
              {filteredAndSortedObjects.length > displayLimit && (
                <div className="col-span-full text-center py-8 mt-6">
                  <button
                    onClick={() => setDisplayLimit(prev => prev + 50)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white rounded-lg transition-all duration-200 hover:scale-105 border border-white/10 hover:border-white/20"
                  >
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Load More ({filteredAndSortedObjects.length - displayLimit} remaining)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Operations Bar */}
      <BulkOperations
        bucketId={bucketId}
        selectedFiles={Array.from(selectedObjects)}
        canWrite={permissions?.canWrite || false}
        onClearSelection={() => setSelectedObjects(new Set())}
        onDelete={() => {
          fetchObjects();
          setSelectedObjects(new Set());
        }}
        onMove={() => {
          fetchObjects();
          setSelectedObjects(new Set());
        }}
        currentPath={currentPath}
      />

      {/* Password Prompt Modal */}
      <PasswordPrompt
        isOpen={showPasswordPrompt}
        onClose={() => {
          setShowPasswordPrompt(false);
          setPasswordError("");
        }}
        onSubmit={handlePasswordSubmit}
        bucketName={bucketName}
        isVerifying={isVerifyingPassword}
        error={passwordError}
      />

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreview
          isOpen={showPreview}
          onClose={handleClosePreview}
          bucketId={bucketId}
          fileKey={previewFile.key}
          fileName={getDisplayName(previewFile.key, previewFile.isFolder)}
          fileSize={previewFile.size}
          onDownload={() => {
            // Optional: Add any additional download tracking here
          }}
        />
      )}
    </div>
  );
}
