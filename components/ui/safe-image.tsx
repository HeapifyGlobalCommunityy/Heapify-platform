/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
}

export function SafeImage({ src, alt, className, fallback, ...props }: SafeImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    if (fallback) return <>{fallback}</>;
    // Default fallback placeholder matching the premium glassmorphism theme
    return (
      <div className={cn("flex items-center justify-center bg-zinc-900/50 border border-zinc-800/50 text-zinc-500", className)}>
        <ImageIcon className="h-1/3 w-1/3 opacity-50" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
