"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function HeapifyLogo({ className }: { className?: string }) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("bg-transparent", className)} />;
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  return (
    <div className={cn("relative overflow-hidden rounded-md", className)}>
      <Image
        src={isDark ? "/Heapify_withbg.jpeg" : "/Heapify_bgless.jpeg"}
        alt="Heapify Global Community Logo"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
