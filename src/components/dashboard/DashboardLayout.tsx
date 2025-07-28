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
    <div className="min-h-screen bg-black">
      {/* Top navigation */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Cloud className="h-7 w-7 text-white" />
              <span className="text-lg font-semibold text-white">S3R2UI</span>
            </Link>

            {/* Bucket Selector */}
            <NavbarBucketSelector />
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 text-sm rounded-lg focus:outline-none hover:bg-white/5 px-2 py-1.5 transition-colors duration-150"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-black font-medium text-sm">
                    {session?.user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-white font-medium hidden sm:block">
                  {session?.user.name}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-black border border-white/10 rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm text-white font-medium">{session?.user.name}</p>
                  <p className="text-sm text-gray-500">{session?.user.email}</p>
                </div>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center px-4 py-2.5 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors duration-150"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors duration-150"
                >
                  <LogOut className="mr-3 h-4 w-4" />
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
