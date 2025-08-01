"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  variant?: "default" | "white" | "red";
}

export function Logo({ 
  size = "md", 
  className, 
  showText = true,
  variant = "default" 
}: LogoProps) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-7 w-7", 
    lg: "h-10 w-10",
    xl: "h-16 w-16"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl", 
    xl: "text-4xl"
  };

  const getColors = () => {
    switch (variant) {
      case "white":
        return {
          primary: "#FFFFFF",
          secondary: "#F3F4F6",
          accent: "#E5E7EB"
        };
      case "red":
        return {
          primary: "#DC2626",
          secondary: "#EF4444", 
          accent: "#B91C1C"
        };
      default:
        return {
          primary: "#DC2626",
          secondary: "#EF4444",
          accent: "#B91C1C"
        };
    }
  };

  const colors = getColors();

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Bucket Logo SVG */}
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={cn(sizeClasses[size], "flex-shrink-0")}
      >
        {/* Bucket body */}
        <path 
          d="M8 12L9 26C9.1 27.1 10 28 11.1 28H20.9C22 28 22.9 27.1 23 26L24 12H8Z" 
          fill={colors.primary}
          stroke={colors.accent} 
          strokeWidth="1.5" 
          strokeLinejoin="round"
        />
        
        {/* Bucket rim */}
        <ellipse 
          cx="16" 
          cy="12" 
          rx="8" 
          ry="2" 
          fill={colors.secondary}
          stroke={colors.accent} 
          strokeWidth="1.5"
        />
        
        {/* Handle */}
        <path 
          d="M10 10C10 8 12 6 16 6C20 6 22 8 22 10" 
          stroke={colors.accent} 
          strokeWidth="2" 
          strokeLinecap="round" 
          fill="none"
        />
        
        {/* Cloud accent */}
        <path 
          d="M20 8C20.5 7.5 21.5 7 22.5 7C24 7 25 8 25 9.5C25 10 24.8 10.4 24.5 10.7" 
          stroke={colors.primary} 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          fill="none" 
          opacity="0.7"
        />
      </svg>

      {/* Brand Text */}
      {showText && (
        <span 
          className={cn(
            "font-semibold tracking-tight",
            textSizeClasses[size],
            variant === "white" ? "text-white" : "hetzner-text"
          )}
        >
          BucketBuddy
        </span>
      )}
    </div>
  );
}

export function LogoIcon({ size = "md", className, variant = "default" }: Omit<LogoProps, "showText">) {
  return <Logo size={size} className={className} showText={false} variant={variant} />;
}
