"use client";

import { useState } from "react";
import { Download, Edit3, Trash2, Copy, Move, MoreVertical } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface FileOperationsProps {
  bucketId: string;
  fileKey: string;
  fileName: string;
  canWrite: boolean;
  onDelete: () => void;
  onRename: (newName: string) => void;
}

export function FileOperations({ bucketId, fileKey, fileName, canWrite, onDelete, onRename }: FileOperationsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [newName, setNewName] = useState(fileName);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

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

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/buckets/${bucketId}/files?key=${encodeURIComponent(fileKey)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDelete();
        addToast({
          type: "success",
          title: "File deleted",
          message: `${fileName} has been deleted`,
        });
      } else {
        const { error } = await response.json();
        addToast({
          type: "error",
          title: "Delete failed",
          message: error || "Failed to delete file",
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Delete failed",
        message: "Failed to delete file",
      });
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  const handleRename = async () => {
    if (newName === fileName || !newName.trim()) {
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

  if (showRename) {
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
              setNewName(fileName);
            }
          }}
          className="px-2 py-1 bg-black border border-white/20 rounded text-white text-sm focus:outline-none focus:border-white/40 transition-colors duration-150"
          autoFocus
        />
        <button
          onClick={handleRename}
          disabled={loading}
          className="px-2 py-1 bg-white text-black hover:bg-gray-100 disabled:bg-white/50 text-xs rounded transition-colors duration-150"
        >
          Save
        </button>
        <button
          onClick={() => {
            setShowRename(false);
            setNewName(fileName);
          }}
          className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded transition-colors duration-150"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-150"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-black border border-white/10 rounded-lg shadow-xl py-2 z-50">
          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors duration-150"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>

          {canWrite && (
            <>
              <button
                onClick={() => {
                  setShowRename(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors duration-150"
              >
                <Edit3 className="h-4 w-4" />
                <span>Rename</span>
              </button>

              <div className="border-t border-white/10 my-2" />

              <button
                onClick={handleDelete}
                disabled={loading}
                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-150"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
