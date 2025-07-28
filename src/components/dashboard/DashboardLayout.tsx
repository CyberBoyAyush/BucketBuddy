"use client";

import { useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Cloud,
  Settings,
  LogOut,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { NavbarBucketSelector } from "./NavbarBucketSelector";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top navigation */}
      <div className="sticky top-0 z-40 bg-gray-800 border-b border-gray-700">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Cloud className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-white">S3R2UI</span>
            </Link>

            {/* Bucket Selector */}
            <NavbarBucketSelector />
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {session?.user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-white font-medium hidden sm:block">
                  {session?.user.name}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm text-white font-medium">{session?.user.name}</p>
                  <p className="text-sm text-gray-400">{session?.user.email}</p>
                </div>
                <Link
                  href="/dashboard/settings"
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="inline mr-2 h-4 w-4" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <LogOut className="inline mr-2 h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page content */}
      <main className="p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
