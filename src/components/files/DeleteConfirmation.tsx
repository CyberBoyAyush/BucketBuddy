"use client";

import { Trash2, AlertTriangle, X } from "lucide-react";

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemCount?: number;
  isLoading?: boolean;
}

export function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemCount,
  isLoading = false
}: DeleteConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="hetzner-card border hetzner-border rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b hetzner-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-400" />
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

        {/* Content */}
        <div className="p-6">
          <p className="hetzner-text-muted mb-6 leading-relaxed">
            {message}
          </p>

          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-300 text-sm font-medium mb-1">
                  This action cannot be undone
                </p>
                <p className="text-red-400/80 text-xs">
                  {itemCount && itemCount > 1
                    ? `All ${itemCount} selected items will be permanently deleted from the bucket.`
                    : "This item will be permanently deleted from the bucket."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 hetzner-text-muted hover:hetzner-text transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="inline-flex items-center px-6 py-2.5 hetzner-red-bg hover:hetzner-red-bg:hover disabled:bg-red-500/50 hetzner-text rounded-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-red-500/25"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete {itemCount && itemCount > 1 ? 'All' : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
