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
        return <Image className={`${iconClass} text-green-500`} />;
      case "video":
        return <Video className={`${iconClass} text-purple-500`} />;
      case "audio":
        return <Music className={`${iconClass} text-pink-500`} />;
      case "document":
        return <FileText className={`${iconClass} text-red-500`} />;
      case "code":
        return <Code className={`${iconClass} text-yellow-500`} />;
      case "archive":
        return <Archive className={`${iconClass} text-orange-500`} />;
      default:
        return <File className={`${iconClass} text-gray-500`} />;
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
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: UploadFile["status"]) => {
    switch (status) {
      case "uploading":
        return "border-blue-500 bg-blue-500/10";
      case "success":
        return "border-green-500 bg-green-500/10";
      case "error":
        return "border-red-500 bg-red-500/10";
      default:
        return "border-gray-600 bg-gray-700/50";
    }
  };

  const totalFiles = uploadFiles.length;
  const successfulUploads = uploadFiles.filter(f => f.status === "success").length;
  const failedUploads = uploadFiles.filter(f => f.status === "error").length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Upload Files</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
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
                  ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
                  : "border-gray-600 hover:border-gray-500 hover:bg-gray-700/20"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                <div className={`p-4 rounded-full mb-4 transition-colors ${
                  isDragActive ? "bg-blue-500/20" : "bg-gray-700/50"
                }`}>
                  <Upload className={`h-12 w-12 transition-colors ${
                    isDragActive ? "text-blue-400" : "text-gray-500"
                  }`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {isDragActive ? "Drop files here" : "Upload files"}
                </h3>
                <p className="text-gray-400 mb-6 max-w-sm">
                  Drag and drop your files here, or click the button below to browse and select files from your computer
                </p>
                <button className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                  <Upload className="h-5 w-5 mr-2" />
                  Choose Files
                </button>
                <p className="text-gray-500 text-xs mt-3">
                  Supports all file types • Max 100MB per file
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress Summary */}
              <div className="bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl p-5 border border-gray-600/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-white font-semibold">
                        Upload Progress
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm">
                      ({successfulUploads}/{totalFiles} files)
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    {successfulUploads > 0 && (
                      <span className="text-green-400 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {successfulUploads} completed
                      </span>
                    )}
                    {failedUploads > 0 && (
                      <span className="text-red-400 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {failedUploads} failed
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(successfulUploads / totalFiles) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>{Math.round((successfulUploads / totalFiles) * 100)}% complete</span>
                  <span>{totalFiles - successfulUploads} remaining</span>
                </div>
              </div>

              {/* File List */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {uploadFiles.map((uploadFile) => (
                  <div
                    key={uploadFile.id}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-all ${getStatusColor(uploadFile.status)}`}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getFileIcon(uploadFile.file.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {uploadFile.file.name}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span>{formatFileSize(uploadFile.file.size)}</span>
                          <span>•</span>
                          <span className="capitalize">{getFileType(uploadFile.file.name)}</span>
                        </div>
                        {uploadFile.status === "uploading" && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                              <span>Uploading...</span>
                              <span>{uploadFile.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-1">
                              <div
                                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${uploadFile.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {uploadFile.error && (
                          <p className="text-red-400 text-xs mt-1 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {uploadFile.error}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getStatusIcon(uploadFile.status)}
                      {uploadFile.status === "pending" && (
                        <button
                          onClick={() => removeFile(uploadFile.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
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
                className={`border border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-blue-500 bg-blue-500/5"
                    : "border-gray-600 hover:border-gray-500 hover:bg-gray-700/20"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-500 mb-2" />
                  <p className="text-gray-400 text-sm font-medium mb-1">
                    {isDragActive ? "Drop files here" : "Add more files"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Drag and drop or click to browse
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {uploadFiles.length > 0 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              {totalFiles} file{totalFiles !== 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={uploadAll}
                disabled={uploading || uploadFiles.filter(f => f.status === "pending").length === 0}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload Files
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
