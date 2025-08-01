"use client";

import { Trash2, Move, X, Download } from "lucide-react";
import { FileOperations } from "./FileOperations";

interface BulkOperationsProps {
  bucketId: string;
  selectedFiles: string[];
  canWrite: boolean;
  onClearSelection: () => void;
  onDelete: () => void;
  onMove?: (destinationPath: string) => void;
  currentPath?: string;
}

export function BulkOperations({
  bucketId,
  selectedFiles,
  canWrite,
  onClearSelection,
  onDelete,
  onMove,
  currentPath = ""
}: BulkOperationsProps) {
  if (selectedFiles.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[50]">
      <div className="hetzner-card border hetzner-border rounded-xl shadow-2xl backdrop-blur-md px-6 py-4 flex items-center space-x-4 min-w-max animate-in slide-in-from-bottom-2 duration-300">
        {/* Selection info */}
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 hetzner-red-bg rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
          <span className="hetzner-text font-semibold">
            {selectedFiles.length} {selectedFiles.length === 1 ? 'item' : 'items'} selected
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Quick Delete Button */}
          {canWrite && (
            <button
              onClick={onDelete}
              className="inline-flex items-center px-3 py-2 bg-red-500/20 hover:bg-red-500/30 hetzner-red hover:text-red-200 rounded-lg transition-all duration-200 hover:scale-105 border border-red-500/30"
              title="Delete selected items"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Delete</span>
            </button>
          )}

          {/* More Actions Menu */}
          <div className="hetzner-hover rounded-lg p-1">
            <FileOperations
              bucketId={bucketId}
              selectedFiles={selectedFiles}
              canWrite={canWrite}
              onDelete={onDelete}
              onMove={onMove}
              currentPath={currentPath}
              isBulk={true}
            />
          </div>

          {/* Clear selection */}
          <button
            onClick={onClearSelection}
            className="p-2 hetzner-text-muted hover:hetzner-text hetzner-hover rounded-lg transition-all duration-200 hover:scale-105"
            title="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
