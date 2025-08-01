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
    <div className="min-h-screen hetzner-bg">
      {/* Top navigation */}
      <div className="sticky top-0 z-40 hetzner-card backdrop-blur-md border-b hetzner-border">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Cloud className="h-7 w-7 hetzner-red" />
              <span className="text-lg font-semibold hetzner-text">BucketBuddy</span>
            </Link>

            {/* Bucket Selector */}
            <NavbarBucketSelector />
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 text-sm rounded-lg focus:outline-none hetzner-hover px-2 py-1.5 transition-colors duration-150"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 hetzner-red-bg rounded-full flex items-center justify-center">
                  <span className="hetzner-text font-medium text-sm">
                    {session?.user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hetzner-text font-medium hidden sm:block">
                  {session?.user.name}
                </span>
                <ChevronDown className="h-4 w-4 hetzner-text-muted" />
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 hetzner-card rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-3 border-b hetzner-border">
                  <p className="text-sm hetzner-text font-medium">{session?.user.name}</p>
                  <p className="text-sm hetzner-text-muted">{session?.user.email}</p>
                </div>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center px-4 py-2.5 text-sm hetzner-text-muted hetzner-hover transition-colors duration-150"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full text-left px-4 py-2.5 text-sm hetzner-text-muted hetzner-hover transition-colors duration-150"
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
      <main className="p-4 sm:p-6 lg:p-8 hetzner-bg">
        {children}
      </main>
    </div>
  );
}
