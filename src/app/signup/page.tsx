"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cloud, Eye, EyeOff, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || "Signup failed");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen hetzner-bg flex items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <Cloud className="h-8 w-8 hetzner-red" />
            <span className="text-xl font-semibold hetzner-text">S3R2UI</span>
          </Link>
          <h2 className="text-2xl font-bold hetzner-text mb-2">Create your account</h2>
          <p className="hetzner-text-muted">Get started with your cloud storage management</p>
        </div>

        <div className="hetzner-card rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium hetzner-text mb-2">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 hetzner-card hetzner-border rounded-lg hetzner-text placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors duration-150"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium hetzner-text mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 hetzner-card hetzner-border rounded-lg hetzner-text placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors duration-150"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium hetzner-text mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 hetzner-card hetzner-border rounded-lg hetzner-text placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors duration-150 pr-10"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hetzner-text-muted hover:hetzner-text transition-colors duration-150"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs hetzner-text-muted mt-1">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium hetzner-text mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 hetzner-card hetzner-border rounded-lg hetzner-text placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors duration-150 pr-10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hetzner-text-muted hover:hetzner-text transition-colors duration-150"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 hetzner-red focus:ring-red-500/20 hetzner-border rounded hetzner-card"
              />
              <label htmlFor="terms" className="ml-2 block text-sm hetzner-text-muted">
                I agree to the{" "}
                <Link href="/terms" className="hetzner-text hover:hetzner-red transition-colors duration-150">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="hetzner-text hover:hetzner-red transition-colors duration-150">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium hetzner-btn-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="hetzner-text-muted">
              Already have an account?{" "}
              <Link
                href="/login"
                className="hetzner-text hover:hetzner-red transition-colors duration-150"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
