"use client";

import { useState, useEffect } from "react";
import { X, Download, ZoomIn, ZoomOut, RotateCw, FileText, Eye, ExternalLink } from "lucide-react";
import { getBucketPassword } from "@/lib/password-manager";
import { useToast } from "@/components/ui/Toast";
import { formatFileSize, getFileType } from "@/lib/utils";

interface FilePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  bucketId: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  onDownload?: () => void;
}

export function FilePreview({
  isOpen,
  onClose,
  bucketId,
  fileKey,
  fileName,
  fileSize,
  onDownload
}: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const { addToast } = useToast();

  const fileType = getFileType(fileName);
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].some(ext => 
    fileName.toLowerCase().endsWith(`.${ext}`)
  );
  const isPdf = fileName.toLowerCase().endsWith('.pdf');
  const isVideo = ["mp4", "webm", "ogg", "mov", "avi"].some(ext => 
    fileName.toLowerCase().endsWith(`.${ext}`)
  );
  const isAudio = ["mp3", "wav", "ogg", "m4a", "flac"].some(ext => 
    fileName.toLowerCase().endsWith(`.${ext}`)
  );
  const isText = ["txt", "md", "json", "xml", "csv", "log"].some(ext => 
    fileName.toLowerCase().endsWith(`.${ext}`)
  );

  useEffect(() => {
    if (isOpen && (isImage || isPdf || isVideo || isAudio || isText)) {
      loadPreview();
    }
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isOpen, fileKey]);

  const loadPreview = async () => {
    setLoading(true);
    setError("");

    try {
      const password = getBucketPassword(bucketId);
      const params = new URLSearchParams();
      params.append('key', fileKey);
      if (password) {
        params.append('password', password);
      }

      const response = await fetch(`/api/buckets/${bucketId}/files/preview?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to load preview: ${response.status}`);
      }

      if (isText) {
        const text = await response.text();
        setPreviewUrl(`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
      } else if (isPdf) {
        // For PDFs, create a blob URL with proper content type
        const blob = await response.blob();
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        setPreviewUrl(url);
      } else {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    } catch (err) {
      console.error('Preview error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const password = getBucketPassword(bucketId);
      if (!password) {
        addToast({
          type: "error",
          title: "Password required",
          message: "Please unlock the bucket first",
        });
        return;
      }

      const response = await fetch(`/api/buckets/${bucketId}/files/download-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: fileKey, password }),
      });

      if (response.ok) {
        const { downloadUrl } = await response.json();
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        addToast({
          type: "success",
          title: "Download started",
          message: `Downloading ${fileName}`,
        });
        
        onDownload?.();
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
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  // Touch gesture handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };

    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const minSwipeDistance = 50;

    // Swipe left/right to close (only if not zoomed)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance && zoom === 100) {
      onClose();
    }

    setTouchStart(null);
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={(e) => {
        // Close on backdrop click (only on desktop)
        if (e.target === e.currentTarget && window.innerWidth >= 640) {
          onClose();
        }
      }}
    >
      <div className="relative w-full h-full max-w-7xl max-h-screen m-0 sm:m-4 hetzner-card border-0 sm:border border-white/20 sm:rounded-xl overflow-hidden flex flex-col">
        {/* Mobile-optimized Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 bg-red-500/10 rounded-lg">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-lg font-semibold text-white truncate" title={fileName}>
                {fileName}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                {formatFileSize(fileSize)} • {fileType.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Mobile-optimized controls */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Image controls - hidden on mobile, shown in bottom bar */}
            {isImage && !loading && !error && (
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
                  title="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-400 min-w-[3rem] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
                  title="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
                  title="Rotate"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-all duration-200"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Download button - responsive */}
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-2 sm:px-4 py-2 hetzner-red-bg hover:hetzner-red-bg:hover text-white rounded-lg transition-all duration-200 hover:scale-105"
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-black/20 relative">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-4">
                <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-white/20 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-sm sm:text-base">Loading preview...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center max-w-md">
                <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Preview not available</h3>
                <p className="text-gray-400 mb-6 text-sm sm:text-base">{error}</p>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 hetzner-red-bg hover:hetzner-red-bg:hover text-white rounded-lg transition-all duration-200"
                >
                  <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Download File
                </button>
              </div>
            </div>
          ) : previewUrl ? (
            <div className="h-full overflow-auto flex items-center justify-center p-2 sm:p-4">
              {isImage && (
                <div
                  className="flex items-center justify-center w-full h-full"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src={previewUrl}
                    alt={fileName}
                    className="max-w-full max-h-full object-contain transition-transform duration-200 touch-manipulation select-none"
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                      touchAction: zoom > 100 ? 'pinch-zoom pan-x pan-y' : 'pinch-zoom'
                    }}
                    draggable={false}
                  />
                </div>
              )}

              {isPdf && (
                <div className="w-full h-full relative">
                  <iframe
                    src={`${previewUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                    className="w-full h-full border-0 sm:rounded-lg bg-white"
                    title={fileName}
                    style={{ minHeight: 'calc(100vh - 120px)' }}
                    onLoad={(e) => {
                      // Check if iframe loaded successfully
                      const iframe = e.target as HTMLIFrameElement;
                      try {
                        // This will throw an error if PDF didn't load properly
                        if (iframe.contentDocument === null) {
                          console.log('PDF loaded in iframe');
                        }
                      } catch (error) {
                        console.warn('PDF iframe access restricted, but this is normal for cross-origin content');
                      }
                    }}
                  />
                  {/* Mobile-optimized PDF controls */}
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex space-x-2">
                    <button
                      onClick={() => window.open(previewUrl, '_blank')}
                      className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-500/90 hover:bg-blue-600 text-white text-xs sm:text-sm rounded-lg transition-all duration-200 backdrop-blur-sm"
                      title="Open PDF in new tab"
                    >
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                      <span className="hidden sm:inline">New Tab</span>
                    </button>
                  </div>
                </div>
              )}

              {isVideo && previewUrl && (
                <video
                  src={previewUrl}
                  controls
                  className="max-w-full max-h-full rounded-lg"
                  style={{ maxHeight: 'calc(100vh - 120px)' }}
                  playsInline
                  preload="metadata"
                >
                  Your browser does not support video playback.
                </video>
              )}

              {isAudio && previewUrl && (
                <div className="text-center px-4">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <audio
                    src={previewUrl}
                    controls
                    className="w-full max-w-md"
                    preload="metadata"
                  >
                    Your browser does not support audio playback.
                  </audio>
                </div>
              )}

              {isText && (
                <div className="w-full max-w-4xl">
                  <iframe
                    src={previewUrl}
                    className="w-full h-full min-h-[400px] sm:min-h-[500px] border border-white/10 rounded-lg bg-white/5"
                    title={fileName}
                    style={{ minHeight: 'calc(100vh - 200px)' }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center max-w-md">
                <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No preview available</h3>
                <p className="text-gray-400 mb-6 text-sm sm:text-base">Unable to load preview for this file</p>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 hetzner-red-bg hover:hetzner-red-bg:hover text-white rounded-lg transition-all duration-200"
                >
                  <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Download File
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile-only bottom control bar for images */}
        {isImage && !loading && !error && (
          <div className="sm:hidden border-t border-white/10 bg-gradient-to-r from-white/5 to-transparent p-3">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleZoomOut}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-400 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
                title="Rotate"
              >
                <RotateCw className="h-4 w-4" />
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-all duration-200"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
