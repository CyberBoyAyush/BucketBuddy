"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";

interface PasswordPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<boolean>;
  title?: string;
  description?: string;
}

export function PasswordPromptModal({
  isOpen,
  onClose,
  onSubmit,
  title = "Enter Password",
  description = "Please enter your encryption password to access bucket credentials.",
}: PasswordPromptModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await onSubmit(password);
      if (success) {
        setPassword("");
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPassword("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Lock className="h-6 w-6 text-red-500" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        
        <p className="text-gray-400 mb-6 text-sm">
          {description}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter encryption password"
              className="w-full px-3 py-2.5 pr-10 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors duration-150"
              required
              disabled={isSubmitting}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Lock className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? "Verifying..." : "Unlock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
