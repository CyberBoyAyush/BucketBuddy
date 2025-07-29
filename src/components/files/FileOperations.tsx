"use client";

import { useState, useEffect, useRef } from "react";
import { Download, Edit3, Trash2, MoreVertical, FolderOpen } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { DeleteConfirmation } from "./DeleteConfirmation";
import { FolderSelector } from "./FolderSelector";

interface FileOperationsProps {
  bucketId: string;
  fileKey?: string;
  fileName?: string;
  selectedFiles?: string[];
  canWrite: boolean;
  onDelete: () => void;
  onRename?: (newName: string) => void;
  onMove?: (destinationPath: string) => void;
  currentPath?: string;
  isBulk?: boolean;
  isFolder?: boolean;
}

export function FileOperations({
  bucketId,
  fileKey,
  fileName,
  selectedFiles = [],
  canWrite,
  onDelete,
  onRename,
  onMove,
  currentPath = "",
  isBulk = false,
  isFolder = false
}: FileOperationsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFolderSelector, setShowFolderSelector] = useState(false);
  const [newName, setNewName] = useState(fileName || "");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/buckets/${bucketId}/files/download-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: fileKey }),
      });

      if (response.ok) {
        const { downloadUrl } = await response.json();
        window.open(downloadUrl, "_blank");
        addToast({
          type: "success",
          title: "Download started",
          message: `Downloading ${fileName}`,
        });
      } else {
        addToast({
          type: "error",
          title: "Download failed",
          message: "Failed to generate download link",
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Download failed",
        message: "Failed to download file",
      });
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      if (isBulk) {
        // Handle bulk delete
        const deletePromises = selectedFiles.map(key =>
          fetch(`/api/buckets/${bucketId}/files?key=${encodeURIComponent(key)}`, {
            method: "DELETE",
          })
        );

        const responses = await Promise.all(deletePromises);
        const failedDeletes = responses.filter(r => !r.ok);

        if (failedDeletes.length === 0) {
          onDelete();
          addToast({
            type: "success",
            title: "Items deleted",
            message: `${selectedFiles.length} items have been deleted`,
          });
        } else {
          addToast({
            type: "error",
            title: "Delete failed",
            message: `Failed to delete ${failedDeletes.length} items`,
          });
        }
      } else {
        // Handle single delete
        if (!fileKey) return;

        const response = await fetch(`/api/buckets/${bucketId}/files?key=${encodeURIComponent(fileKey)}`, {
          method: "DELETE",
        });

        if (response.ok) {
          onDelete();
          const itemType = isFolder ? "folder" : "file";
          addToast({
            type: "success",
            title: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted`,
            message: `${fileName} has been deleted`,
          });
        } else {
          const { error } = await response.json();
          addToast({
            type: "error",
            title: "Delete failed",
            message: error || "Failed to delete item",
          });
        }
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Delete failed",
        message: "Failed to delete item(s)",
      });
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleRename = async () => {
    if (!fileKey || !onRename || newName === fileName || !newName.trim()) {
      setShowRename(false);
      return;
    }

    setLoading(true);
    try {
      const pathParts = fileKey.split("/");
      pathParts[pathParts.length - 1] = newName.trim();
      const newKey = pathParts.join("/");

      const response = await fetch(`/api/buckets/${bucketId}/files/rename`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceKey: fileKey,
          destinationKey: newKey,
        }),
      });

      if (response.ok) {
        onRename(newName.trim());
        addToast({
          type: "success",
          title: "File renamed",
          message: `Renamed to ${newName.trim()}`,
        });
      } else {
        const { error } = await response.json();
        addToast({
          type: "error",
          title: "Rename failed",
          message: error || "Failed to rename file",
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Rename failed",
        message: "Failed to rename file",
      });
    } finally {
      setLoading(false);
      setShowRename(false);
      setShowMenu(false);
    }
  };

  const handleMoveToFolderClick = () => {
    setShowFolderSelector(true);
    setShowMenu(false);
  };

  const handleMoveToFolder = async (destinationPath: string) => {
    setLoading(true);
    try {
      if (isBulk) {
        // Handle bulk move
        const movePromises = selectedFiles.map(key => {
          const fileName = key.split('/').pop() || '';
          const newKey = destinationPath
            ? (destinationPath.endsWith('/') ? `${destinationPath}${fileName}` : `${destinationPath}/${fileName}`)
            : fileName;

          return fetch(`/api/buckets/${bucketId}/files/move`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sourceKey: key,
              destinationKey: newKey,
            }),
          });
        });

        const responses = await Promise.all(movePromises);
        const failedMoves = responses.filter(r => !r.ok);

        if (failedMoves.length === 0) {
          onMove?.(destinationPath);
          addToast({
            type: "success",
            title: "Items moved",
            message: `${selectedFiles.length} items moved successfully`,
          });
        } else {
          addToast({
            type: "error",
            title: "Move failed",
            message: `Failed to move ${failedMoves.length} items`,
          });
        }
      } else {
        // Handle single move
        if (!fileKey) return;

        const fileName = fileKey.split('/').pop() || '';
        const newKey = destinationPath
          ? (destinationPath.endsWith('/') ? `${destinationPath}${fileName}` : `${destinationPath}/${fileName}`)
          : fileName;

        const response = await fetch(`/api/buckets/${bucketId}/files/move`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceKey: fileKey,
            destinationKey: newKey,
          }),
        });

        if (response.ok) {
          onMove?.(destinationPath);
          const itemType = isFolder ? "folder" : "file";
          addToast({
            type: "success",
            title: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} moved`,
            message: `Moved to ${destinationPath || "root"}`,
          });
        } else {
          const { error } = await response.json();
          addToast({
            type: "error",
            title: "Move failed",
            message: error || "Failed to move item",
          });
        }
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Move failed",
        message: "Failed to move item(s)",
      });
    } finally {
      setLoading(false);
      setShowFolderSelector(false);
    }
  };

  if (showRename && !isBulk) {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleRename();
            } else if (e.key === "Escape") {
              setShowRename(false);
              setNewName(fileName || "");
            }
          }}
          className="px-3 py-2 hetzner-card border hetzner-border rounded-lg hetzner-text text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
          autoFocus
        />
        <button
          onClick={handleRename}
          disabled={loading}
          className="px-3 py-2 hetzner-red-bg hover:hetzner-red-bg:hover disabled:bg-red-500/50 hetzner-text text-sm rounded-lg transition-all duration-200"
        >
          {loading ? "..." : "Save"}
        </button>
        <button
          onClick={() => {
            setShowRename(false);
            setNewName(fileName || "");
          }}
          className="px-3 py-2 hetzner-hover hover:bg-gray-700 hetzner-text text-sm rounded-lg transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    );
  }



  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`p-2 rounded-lg transition-all duration-200 ${
          isBulk
            ? showMenu
              ? "hetzner-text hetzner-card shadow-lg border hetzner-border"
              : "hetzner-text hover:hetzner-text hetzner-hover border hetzner-border bg-black/20"
            : showMenu
              ? "hetzner-text bg-red-500/20 shadow-lg border border-red-500/30"
              : "hetzner-text-muted hover:hetzner-text hetzner-hover border border-transparent"
        }`}
        title={isBulk ? `More actions for ${selectedFiles.length} items` : "File actions"}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {showMenu && (
        <div className={`absolute ${isBulk ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 w-52 hetzner-card border-2 hetzner-border rounded-xl shadow-2xl py-3 z-[200] backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-200`}>
          {/* Header for bulk operations */}
          {isBulk && (
            <div className="px-4 py-2 border-b hetzner-border mb-2">
              <p className="text-xs font-medium hetzner-text-muted">
                {selectedFiles.length} items selected
              </p>
            </div>
          )}

          {/* Download option - only for single files */}
          {!isBulk && (
            <button
              onClick={handleDownload}
              disabled={loading}
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm hetzner-text-muted hetzner-hover hover:hetzner-text transition-all duration-200 disabled:opacity-50 rounded-lg mx-2"
            >
              <Download className="h-4 w-4 text-blue-400" />
              <span>Download</span>
            </button>
          )}

          {canWrite && (
            <>
              {/* Rename option - only for single files */}
              {!isBulk && onRename && (
                <button
                  onClick={() => {
                    setShowRename(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm hetzner-text-muted hetzner-hover hover:hetzner-text transition-all duration-200 rounded-lg mx-2"
                >
                  <Edit3 className="h-4 w-4 text-green-400" />
                  <span>Rename</span>
                </button>
              )}

              {/* Move to Folder option */}
              {onMove && (
                <button
                  onClick={handleMoveToFolderClick}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm hetzner-text-muted hetzner-hover hover:hetzner-text transition-all duration-200 rounded-lg mx-2"
                >
                  <FolderOpen className="h-4 w-4 text-purple-400" />
                  <span>Move to Folder {isBulk ? `(${selectedFiles.length} items)` : ''}</span>
                </button>
              )}

              {/* Separator */}
              <div className="border-t hetzner-border my-2 mx-2" />

              {/* Delete option */}
              <button
                onClick={handleDeleteClick}
                disabled={loading}
                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm hetzner-red hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 disabled:opacity-50 rounded-lg mx-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>
                  {isBulk
                    ? `Delete All (${selectedFiles.length} items)`
                    : `Delete ${isFolder ? 'Folder' : 'File'}`
                  }
                </span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title={isBulk ? "Delete Multiple Items" : `Delete ${isFolder ? 'Folder' : 'File'}`}
        message={
          isBulk
            ? `Are you sure you want to delete ${selectedFiles.length} selected items?`
            : `Are you sure you want to delete "${fileName}"?`
        }
        itemCount={isBulk ? selectedFiles.length : undefined}
        isLoading={loading}
      />

      {/* Folder Selector Modal */}
      <FolderSelector
        isOpen={showFolderSelector}
        onClose={() => setShowFolderSelector(false)}
        onSelect={handleMoveToFolder}
        bucketId={bucketId}
        currentPath={currentPath}
        title={isBulk ? "Move Multiple Items" : `Move ${isFolder ? 'Folder' : 'File'}`}
        itemCount={isBulk ? selectedFiles.length : undefined}
        isLoading={loading}
      />
    </div>
  );
}
