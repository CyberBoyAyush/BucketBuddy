"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Loader2, X } from "lucide-react";

interface PasswordPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
  bucketName: string;
  isVerifying?: boolean;
  error?: string;
}

export function PasswordPrompt({
  isOpen,
  onClose,
  onSubmit,
  bucketName,
  isVerifying = false,
  error,
}: PasswordPromptProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    
    try {
      await onSubmit(password);
      setPassword(""); // Clear password on success
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const handleClose = () => {
    setPassword("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="hetzner-card rounded-xl p-6 w-full max-w-md mx-auto border hetzner-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Lock className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold hetzner-text">Bucket Password Required</h2>
              <p className="text-sm hetzner-text-muted">Enter password to access "{bucketName}"</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hetzner-text-muted hover:hetzner-text rounded-lg transition-colors"
            disabled={isVerifying}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium hetzner-text mb-2">
              Encryption Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 hetzner-card hetzner-border rounded-lg hetzner-text placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors duration-150 pr-10"
                placeholder="Enter your bucket password"
                required
                disabled={isVerifying}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hetzner-text-muted hover:hetzner-text transition-colors duration-150"
                disabled={isVerifying}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <Lock className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-400">
                <p className="font-medium mb-1">Security Information:</p>
                <ul className="space-y-1">
                  <li>• This password decrypts your bucket credentials</li>
                  <li>• Password is stored locally for this session</li>
                  <li>• We never store your password on our servers</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 hetzner-btn-secondary rounded-lg transition-colors duration-150"
              disabled={isVerifying}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || !password.trim()}
              className="inline-flex items-center px-4 py-2 hetzner-btn-primary disabled:opacity-50 rounded-lg transition-colors duration-150"
            >
              {isVerifying ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Lock className="h-4 w-4 mr-2" />
              )}
              {isVerifying ? "Verifying..." : "Unlock Bucket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
