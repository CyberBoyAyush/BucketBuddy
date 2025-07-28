"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, File, CheckCircle, AlertCircle, Loader2, FileText, Image, Video, Music, Archive, Code } from "lucide-react";
import { formatFileSize, sanitizeS3Key, getFileType } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { parseError, logError, handleApiResponse } from "@/lib/error-handling";

interface FileUploadProps {
  bucketId: string;
  currentPath: string;
  onUploadComplete: () => void;
  onClose: () => void;
}

interface UploadFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

export function FileUpload({ bucketId, currentPath, onUploadComplete, onClose }: FileUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const { addToast } = useToast();

  const getFileIcon = (fileName: string) => {
    const fileType = getFileType(fileName);
    const iconClass = "h-5 w-5";

    switch (fileType) {
      case "image":
        return <Image className={`${iconClass} text-green-400`} />;
      case "video":
        return <Video className={`${iconClass} text-purple-400`} />;
      case "audio":
        return <Music className={`${iconClass} text-pink-400`} />;
      case "document":
        return <FileText className={`${iconClass} hetzner-red`} />;
      case "code":
        return <Code className={`${iconClass} text-yellow-400`} />;
      case "archive":
        return <Archive className={`${iconClass} text-orange-400`} />;
      default:
        return <File className={`${iconClass} hetzner-text-muted`} />;
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substring(2, 11),
      status: "pending",
      progress: 0,
    }));
    setUploadFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFile = async (uploadFile: UploadFile): Promise<void> => {
    const { file, id } = uploadFile;
    
    try {
      // Update status to uploading
      setUploadFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status: "uploading", progress: 0 } : f
      ));

      // Sanitize the file key
      const fileName = sanitizeS3Key(file.name);
      const fileKey = currentPath + fileName;

      // Get upload URL
      const response = await fetch(`/api/buckets/${bucketId}/files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: fileKey,
          contentType: file.type,
        }),
      });

      await handleApiResponse(response);

      const { uploadUrl } = await response.json();

      // Upload file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      // Update status to success
      setUploadFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status: "success", progress: 100 } : f
      ));

    } catch (error) {
      logError(error, `File upload for ${file.name}`);
      const parsedError = parseError(error);

      setUploadFiles(prev => prev.map(f =>
        f.id === id ? {
          ...f,
          status: "error",
          error: parsedError.message
        } : f
      ));
    }
  };

  const uploadAll = async () => {
    setUploading(true);
    
    const pendingFiles = uploadFiles.filter(f => f.status === "pending");
    
    // Upload files in parallel (limit to 3 concurrent uploads)
    const uploadPromises = pendingFiles.map(uploadFile);
    await Promise.all(uploadPromises);
    
    setUploading(false);
    
    // Check if all uploads were successful
    const hasErrors = uploadFiles.some(f => f.status === "error");
    const successCount = uploadFiles.filter(f => f.status === "success").length;

    if (!hasErrors) {
      addToast({
        type: "success",
        title: "Upload complete",
        message: `Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}`,
      });
      onUploadComplete();
      onClose();
    } else {
      const errorCount = uploadFiles.filter(f => f.status === "error").length;
      addToast({
        type: "error",
        title: "Upload completed with errors",
        message: `${errorCount} file${errorCount !== 1 ? 's' : ''} failed to upload`,
      });
    }
  };

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="h-4 w-4 hetzner-red animate-spin" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <File className="h-4 w-4 hetzner-text-muted" />;
    }
  };

  const getStatusColor = (status: UploadFile["status"]) => {
    switch (status) {
      case "uploading":
        return "hetzner-border bg-red-500/5";
      case "success":
        return "border-green-500/20 bg-green-500/5";
      case "error":
        return "border-red-500/20 bg-red-500/5";
      default:
        return "hetzner-border bg-white/5";
    }
  };

  const totalFiles = uploadFiles.length;
  const successfulUploads = uploadFiles.filter(f => f.status === "success").length;
  const failedUploads = uploadFiles.filter(f => f.status === "error").length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="hetzner-card rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b hetzner-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 hetzner-red-bg rounded-lg">
              <Upload className="h-5 w-5 hetzner-text" />
            </div>
            <div>
              <h2 className="text-lg font-semibold hetzner-text">Upload Files</h2>
              <p className="text-sm hetzner-text-muted">Add files to {currentPath || 'root directory'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hetzner-text-muted hover:hetzner-text hetzner-hover rounded-lg transition-colors duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          {uploadFiles.length === 0 ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? "border-red-500/50 bg-red-500/5 scale-[1.01] shadow-lg shadow-red-500/10"
                  : "hetzner-border hover:border-red-500/30 hover:bg-red-500/[0.02]"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                <div className={`p-6 rounded-xl mb-6 transition-all duration-200 ${
                  isDragActive ? "bg-red-500/10 scale-110" : "bg-white/5"
                }`}>
                  <Upload className={`h-12 w-12 transition-all duration-200 ${
                    isDragActive ? "hetzner-red scale-110" : "hetzner-text-muted"
                  }`} />
                </div>
                <h3 className="text-xl font-semibold hetzner-text mb-3">
                  {isDragActive ? "Drop files here" : "Upload your files"}
                </h3>
                <p className="hetzner-text-muted mb-8 max-w-md leading-relaxed text-center">
                  Drag and drop your files here, or click the button below to browse and select files from your computer
                </p>
                <button className="inline-flex items-center px-8 py-3 hetzner-btn-primary rounded-lg transition-all duration-150 font-medium shadow-lg hover:shadow-xl">
                  <Upload className="h-5 w-5 mr-2" />
                  Choose Files
                </button>
                <div className="flex items-center space-x-4 mt-6 text-xs hetzner-text-subtle">
                  <span className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    All file types supported
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Max 100MB per file
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress Summary */}
              <div className="bg-white/5 rounded-xl p-6 hetzner-border">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <span className="hetzner-text font-semibold text-lg">
                        Upload Progress
                      </span>
                      <p className="hetzner-text-muted text-sm">
                        {successfulUploads} of {totalFiles} files completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    {successfulUploads > 0 && (
                      <div className="flex items-center px-3 py-1 bg-green-500/10 rounded-full">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-400" />
                        <span className="text-green-400 font-medium">{successfulUploads} completed</span>
                      </div>
                    )}
                    {failedUploads > 0 && (
                      <div className="flex items-center px-3 py-1 bg-red-500/10 rounded-full">
                        <AlertCircle className="h-3 w-3 mr-1 text-red-400" />
                        <span className="text-red-400 font-medium">{failedUploads} failed</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-400 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                      style={{ width: `${(successfulUploads / totalFiles) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="hetzner-text font-medium">{Math.round((successfulUploads / totalFiles) * 100)}% complete</span>
                    <span className="hetzner-text-muted">{totalFiles - successfulUploads} remaining</span>
                  </div>
                </div>
              </div>

              {/* File List */}
              <div className="max-h-80 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {uploadFiles.map((uploadFile) => (
                  <div
                    key={uploadFile.id}
                    className={`flex items-center justify-between p-5 border rounded-xl transition-all duration-200 hover:shadow-sm ${getStatusColor(uploadFile.status)}`}
                  >
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="flex-shrink-0 p-2 bg-white/5 rounded-lg">
                        {getFileIcon(uploadFile.file.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="hetzner-text font-medium truncate text-base">
                          {uploadFile.file.name}
                        </p>
                        <div className="flex items-center space-x-3 text-sm hetzner-text-muted mt-1">
                          <span className="font-medium">{formatFileSize(uploadFile.file.size)}</span>
                          <span>•</span>
                          <span className="capitalize px-2 py-0.5 bg-white/10 rounded-full text-xs">
                            {getFileType(uploadFile.file.name)}
                          </span>
                        </div>
                        {uploadFile.status === "uploading" && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm hetzner-text-muted mb-2">
                              <span className="flex items-center">
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Uploading...
                              </span>
                              <span className="font-medium">{uploadFile.progress}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-300 shadow-sm"
                                style={{ width: `${uploadFile.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {uploadFile.error && (
                          <div className="mt-2 p-2 bg-red-500/10 rounded-lg">
                            <p className="text-red-400 text-sm flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                              {uploadFile.error}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 ml-4">
                      <div className="p-2 rounded-lg bg-white/5">
                        {getStatusIcon(uploadFile.status)}
                      </div>
                      {uploadFile.status === "pending" && (
                        <button
                          onClick={() => removeFile(uploadFile.id)}
                          className="p-2 hetzner-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-150"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add More Files */}
              <div
                {...getRootProps()}
                className={`border border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? "border-red-500/50 bg-red-500/5 scale-[1.01]"
                    : "hetzner-border hover:border-red-500/30 hover:bg-red-500/[0.02]"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <div className={`p-3 rounded-lg mb-3 transition-all duration-200 ${
                    isDragActive ? "bg-red-500/10 scale-110" : "bg-white/5"
                  }`}>
                    <Upload className={`h-6 w-6 transition-all duration-200 ${
                      isDragActive ? "hetzner-red" : "hetzner-text-muted"
                    }`} />
                  </div>
                  <p className="hetzner-text font-medium mb-1">
                    {isDragActive ? "Drop files here" : "Add more files"}
                  </p>
                  <p className="hetzner-text-subtle text-sm">
                    Drag and drop or click to browse
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {uploadFiles.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t hetzner-border bg-white/[0.02]">
            <div className="flex items-center space-x-4">
              <div className="text-sm hetzner-text-muted">
                <span className="font-medium hetzner-text">{totalFiles}</span> file{totalFiles !== 1 ? 's' : ''} selected
              </div>
              {uploading && (
                <div className="flex items-center text-sm hetzner-text-muted">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin hetzner-red" />
                  Uploading files...
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                disabled={uploading}
                className="px-6 py-2 hetzner-btn-secondary disabled:opacity-50 rounded-lg transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={uploadAll}
                disabled={uploading || uploadFiles.filter(f => f.status === "pending").length === 0}
                className="inline-flex items-center px-6 py-2 hetzner-btn-primary disabled:opacity-50 rounded-lg transition-all duration-150 shadow-lg hover:shadow-xl"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload {uploadFiles.filter(f => f.status === "pending").length} Files
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
