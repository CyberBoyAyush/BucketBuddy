"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, CheckCircle, XCircle, Info } from "lucide-react";
import { S3_PROVIDERS, getProviderById, getProviderEndpoint } from "@/lib/s3-providers";

interface BucketFormProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  initialData?: any;
}

export function BucketForm({ onSubmit, isSubmitting, initialData }: BucketFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    provider: "aws",
    region: "us-east-1",
    endpoint: "",
    accessKey: "",
    secretKey: "",
    bucketName: "",
    ...initialData,
  });

  const [showSecretKey, setShowSecretKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    status: "idle" | "testing" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });
  const [error, setError] = useState("");
  const [showCorsInstructions, setShowCorsInstructions] = useState(false);

  const selectedProvider = getProviderById(formData.provider);

  useEffect(() => {
    if (selectedProvider) {
      setFormData(prev => ({
        ...prev,
        region: selectedProvider.defaultRegion,
        endpoint: selectedProvider.defaultEndpoint || "",
      }));
    }
  }, [formData.provider, selectedProvider]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setConnectionStatus({ status: "idle", message: "" });
    setError("");
  };

  const testConnection = async () => {
    if (!formData.accessKey || !formData.secretKey || !formData.bucketName) {
      setError("Please fill in all required fields before testing connection");
      return;
    }

    setConnectionStatus({ status: "testing", message: "Testing connection..." });

    try {
      const response = await fetch("/api/buckets/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: formData.provider,
          region: formData.region,
          endpoint: formData.endpoint || undefined,
          accessKey: formData.accessKey,
          secretKey: formData.secretKey,
          bucketName: formData.bucketName,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setConnectionStatus({
          status: "success",
          message: result.message,
        });
      } else {
        setConnectionStatus({
          status: "error",
          message: result.message,
        });
      }
    } catch (error) {
      setConnectionStatus({
        status: "error",
        message: "Failed to test connection. Please try again.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (connectionStatus.status !== "success") {
      setError("Please test the connection successfully before saving");
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save bucket");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Basic Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bucket Name (Display Name)
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="My Documents"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            A friendly name to identify this bucket in your dashboard
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Storage Provider
          </label>
          <select
            value={formData.provider}
            onChange={(e) => handleInputChange("provider", e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {S3_PROVIDERS.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Connection Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Connection Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Region
            </label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => handleInputChange("region", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={selectedProvider?.defaultRegion}
              required
            />
          </div>

          {selectedProvider?.requiresEndpoint && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Endpoint URL
              </label>
              <input
                type="url"
                value={formData.endpoint}
                onChange={(e) => handleInputChange("endpoint", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={getProviderEndpoint(selectedProvider, formData.region)}
                required
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bucket Name (Actual Bucket)
          </label>
          <input
            type="text"
            value={formData.bucketName}
            onChange={(e) => handleInputChange("bucketName", e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="my-actual-bucket-name"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            The actual name of your bucket in the storage provider
          </p>
        </div>
      </div>

      {/* Credentials */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Access Credentials</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Access Key ID
          </label>
          <input
            type="text"
            value={formData.accessKey}
            onChange={(e) => handleInputChange("accessKey", e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your access key ID"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Secret Access Key
          </label>
          <div className="relative">
            <input
              type={showSecretKey ? "text" : "password"}
              value={formData.secretKey}
              onChange={(e) => handleInputChange("secretKey", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              placeholder="Your secret access key"
              required
            />
            <button
              type="button"
              onClick={() => setShowSecretKey(!showSecretKey)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
            >
              {showSecretKey ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Connection Test */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Connection Test</h3>
          <button
            type="button"
            onClick={testConnection}
            disabled={connectionStatus.status === "testing"}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
          >
            {connectionStatus.status === "testing" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Test Connection
          </button>
        </div>

        {connectionStatus.status !== "idle" && (
          <div
            className={`p-4 rounded-lg border ${
              connectionStatus.status === "success"
                ? "bg-green-500/10 border-green-500/20"
                : connectionStatus.status === "error"
                ? "bg-red-500/10 border-red-500/20"
                : "bg-blue-500/10 border-blue-500/20"
            }`}
          >
            <div className="flex items-center space-x-2">
              {connectionStatus.status === "testing" && (
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
              )}
              {connectionStatus.status === "success" && (
                <CheckCircle className="h-5 w-5 text-green-400" />
              )}
              {connectionStatus.status === "error" && (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
              <p
                className={`text-sm ${
                  connectionStatus.status === "success"
                    ? "text-green-400"
                    : connectionStatus.status === "error"
                    ? "text-red-400"
                    : "text-blue-400"
                }`}
              >
                {connectionStatus.message}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CORS Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">CORS Configuration</h3>
          <button
            type="button"
            onClick={() => setShowCorsInstructions(!showCorsInstructions)}
            className="inline-flex items-center px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            <Info className="h-4 w-4 mr-2" />
            {showCorsInstructions ? "Hide" : "Show"} Instructions
          </button>
        </div>

        {showCorsInstructions && selectedProvider && (
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">
              CORS Setup for {selectedProvider.name}
            </h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p className="text-yellow-400 mb-3">
                ⚠️ You must configure CORS on your bucket to allow file uploads from this website.
              </p>
              <pre className="bg-gray-800 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                {selectedProvider.corsInstructions}
              </pre>
              <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                <p className="text-blue-400 text-xs">
                  <strong>Setup Guide:</strong> {selectedProvider.setupGuide}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || connectionStatus.status !== "success"}
          className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          {initialData ? "Update Bucket" : "Add Bucket"}
        </button>
      </div>
    </form>
  );
}
