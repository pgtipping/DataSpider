import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({
  size = 24,
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader2 className={`animate-spin ${className}`} size={size} />
    </div>
  );
}
