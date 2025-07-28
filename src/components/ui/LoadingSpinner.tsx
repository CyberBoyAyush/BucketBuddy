import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "default" | "muted";
}

export function LoadingSpinner({
  size = "md",
  className,
  variant = "default"
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  const variantClasses = {
    default: "text-white",
    muted: "text-gray-500"
  };

  return (
    <Loader2
      className={cn(
        "animate-spin transition-colors duration-200",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  );
}
